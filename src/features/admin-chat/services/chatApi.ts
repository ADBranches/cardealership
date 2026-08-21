import { authenticatedApiRequest, type AuthenticatedApiFetcher } from "../../../api/client";
import { adminChatConversations, adminChatMessagesByInquiry } from "../data/adminChatFixtures";
import type { ChatConversationSummary, ChatMessage } from "../types";
import { mergeChatHistory, normalizeChatHistory, type NormalizationIssue } from "./chatNormalization";

export const CHAT_HISTORY_ENDPOINT = (inquiryId: string) => `api/chat/conversations/${encodeURIComponent(inquiryId)}/messages`;
export const CHAT_CONVERSATIONS_ENDPOINT_PENDING = null;
export const CHAT_MARK_READ_ENDPOINT_PENDING = null;

export type ChatHistoryPagination = {
  cursor?: string;
  limit?: number;
};

export type ChatApiOptions = {
  mockMode?: boolean;
  fetcher?: AuthenticatedApiFetcher;
  signal?: AbortSignal;
};

export type ChatHistoryResult = {
  messages: ChatMessage[];
  issues: NormalizationIssue[];
  hasMore: boolean;
  nextCursor: string | null;
  mock: boolean;
};

export function isChatApiMockMode(value: string | undefined = import.meta.env.VITE_CHAT_API_MOCK_MODE): boolean {
  return value !== "false";
}

export async function getAdminConversations(accessToken: string, options: ChatApiOptions = {}): Promise<ChatConversationSummary[]> {
  void accessToken;
  if (options.mockMode ?? isChatApiMockMode()) return adminChatConversations.map((conversation) => ({ ...conversation }));
  throw new Error("Admin conversation listing remains blocked until Ronald confirms the endpoint.");
}

export async function getConversationHistory(inquiryId: string, accessToken: string, pagination: ChatHistoryPagination = {}, options: ChatApiOptions = {}): Promise<ChatHistoryResult> {
  const normalizedId = inquiryId.trim();
  if (!normalizedId) throw new Error("An inquiry identifier is required.");
  if (options.mockMode ?? isChatApiMockMode()) {
    const messages = adminChatMessagesByInquiry[normalizedId] ?? [];
    return { messages: mergeChatHistory(messages, []), issues: [], hasMore: false, nextCursor: null, mock: true };
  }
  const query = new URLSearchParams();
  if (pagination.cursor) query.set("cursor", pagination.cursor);
  if (pagination.limit) query.set("limit", String(Math.max(1, Math.floor(pagination.limit))));
  const path = `${CHAT_HISTORY_ENDPOINT(normalizedId)}${query.size ? `?${query.toString()}` : ""}`;
  const fetcher = options.fetcher ?? authenticatedApiRequest;
  const response = await fetcher(path, accessToken, { signal: options.signal });
  if (!response.ok) throw new Error("Conversation history could not be loaded.");
  const payload = await response.json().catch(() => ({}));
  const normalized = normalizeChatHistory(payload, normalizedId);
  const root = typeof payload === "object" && payload !== null ? payload as Record<string, unknown> : {};
  return { ...normalized, hasMore: root.hasMore === true, nextCursor: typeof root.nextCursor === "string" ? root.nextCursor : null, mock: false };
}

export async function markConversationRead(inquiryId: string, accessToken: string, options: ChatApiOptions = {}): Promise<{ readAt: string; mock: boolean }> {
  void accessToken;
  const normalizedId = inquiryId.trim();
  if (!normalizedId) throw new Error("An inquiry identifier is required.");
  if (options.mockMode ?? isChatApiMockMode()) return { readAt: new Date().toISOString(), mock: true };
  throw new Error("Mark-as-read remains blocked until Ronald confirms the endpoint.");
}
