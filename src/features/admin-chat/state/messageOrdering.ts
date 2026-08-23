import type { ChatConversationSummary, ChatMessage } from "../types";

function timestampValue(value: string | undefined): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function compareMessages(
  left: ChatMessage,
  right: ChatMessage,
): number {
  const timeDifference =
    timestampValue(left.createdAt) - timestampValue(right.createdAt);

  if (timeDifference !== 0) return timeDifference;
  return left.id.localeCompare(right.id);
}

export function orderMessages(
  messages: readonly ChatMessage[],
): ChatMessage[] {
  return [...messages].sort(compareMessages);
}

export function deduplicateMessages(
  messages: readonly ChatMessage[],
): ChatMessage[] {
  const messagesById = new Map<string, ChatMessage>();

  for (const message of messages) {
    if (!messagesById.has(message.id)) {
      messagesById.set(message.id, message);
    }
  }

  return orderMessages([...messagesById.values()]);
}

function conversationActivityTime(
  conversation: ChatConversationSummary,
): number {
  return timestampValue(
    conversation.latestMessage?.createdAt ?? conversation.inquiry.updatedAt,
  );
}

export function orderConversations(
  conversations: readonly ChatConversationSummary[],
): ChatConversationSummary[] {
  return [...conversations].sort((left, right) => {
    const activityDifference =
      conversationActivityTime(right) - conversationActivityTime(left);

    if (activityDifference !== 0) return activityDifference;
    return left.inquiry.id.localeCompare(right.inquiry.id);
  });
}
