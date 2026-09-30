import type { ChatMessage, ChatSenderRole } from "../types";
import { orderMessages } from "../state/messageOrdering";

export type RawChatHistoryRow = {
  id?: unknown;
  conversation_id?: unknown;
  sender?: unknown;
  message?: unknown;
  created_at?: unknown;
  client_message_id?: unknown;
};

export type NormalizationIssue = {
  index: number;
  code: "MALFORMED_CHAT_RECORD";
  message: string;
};

export type NormalizedChatHistory = {
  messages: ChatMessage[];
  issues: NormalizationIssue[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeSenderRole(value: unknown): ChatSenderRole | null {
  if (value === "customer" || value === "admin") return value;
  if (isRecord(value) && (value.role === "customer" || value.role === "admin")) {
    return value.role;
  }
  return null;
}

function normalizeSenderId(value: unknown, role: ChatSenderRole): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (isRecord(value) && typeof value.id === "string" && value.id.trim()) return value.id.trim();
  return `${role}-unknown`;
}

export function normalizeChatHistory(payload: unknown, fallbackInquiryId: string): NormalizedChatHistory {
  const root = isRecord(payload) ? payload : {};
  const rows = Array.isArray(root.messages) ? root.messages : [];
  const messages: ChatMessage[] = [];
  const issues: NormalizationIssue[] = [];

  rows.forEach((row, index) => {
    if (!isRecord(row)) {
      issues.push({ index, code: "MALFORMED_CHAT_RECORD", message: "A chat record could not be normalized." });
      return;
    }
    const role = normalizeSenderRole(row.sender);
    const id = typeof row.id === "string" ? row.id.trim() : "";
    const inquiryId = typeof row.conversation_id === "string" ? row.conversation_id.trim() : fallbackInquiryId;
    const message = typeof row.message === "string" ? row.message.trim() : "";
    const createdAt = typeof row.created_at === "string" ? row.created_at : "";
    if (!id || !inquiryId || !role || !message || !Number.isFinite(Date.parse(createdAt))) {
      issues.push({ index, code: "MALFORMED_CHAT_RECORD", message: "A chat record could not be normalized." });
      return;
    }
    messages.push({
      id,
      inquiryId,
      senderId: normalizeSenderId(row.sender, role),
      senderRole: role,
      message,
      createdAt,
      deliveryStatus: "sent",
      clientMessageId: typeof row.client_message_id === "string" ? row.client_message_id : undefined,
    });
  });

  return { messages: orderMessages(messages), issues };
}

export function mergeChatHistory(stored: readonly ChatMessage[], current: readonly ChatMessage[]): ChatMessage[] {
  const byId = new Map<string, ChatMessage>();
  for (const message of [...current, ...stored]) {
    const optimisticMatch = message.clientMessageId
      ? [...byId.values()].find((item) => item.clientMessageId === message.clientMessageId)
      : undefined;
    if (optimisticMatch && optimisticMatch.id !== message.id) byId.delete(optimisticMatch.id);
    byId.set(message.id, { ...optimisticMatch, ...message });
  }
  return orderMessages([...byId.values()]);
}
