import type {
  AdminChatState,
  ChatConversationSummary,
  ChatMessage,
  UnreadConversationState,
} from "../types";

export function shouldIncrementUnreadCount(
  activeInquiryId: string | null,
  message: ChatMessage,
): boolean {
  return (
    message.senderRole === "customer" &&
    message.inquiryId !== activeInquiryId
  );
}

export function nextUnreadCount(
  currentCount: number,
  shouldIncrement: boolean,
): number {
  const safeCount = Math.max(0, currentCount);
  return shouldIncrement ? safeCount + 1 : safeCount;
}

export function createUnreadConversationState(
  inquiryId: string,
  unreadCount = 0,
  lastReadAt: string | null = null,
): UnreadConversationState {
  return {
    inquiryId,
    unreadCount: Math.max(0, unreadCount),
    lastReadAt,
  };
}

export function markConversationRead(
  state: AdminChatState,
  inquiryId: string,
  readAt: string,
): AdminChatState {
  const conversationExists = state.conversations.some(
    (conversation) => conversation.inquiry.id === inquiryId,
  );

  if (!conversationExists) return state;

  const conversations = state.conversations.map((conversation) =>
    conversation.inquiry.id === inquiryId
      ? { ...conversation, unreadCount: 0, lastReadAt: readAt }
      : conversation,
  );

  return {
    ...state,
    conversations,
    unreadByInquiry: {
      ...state.unreadByInquiry,
      ...Object.fromEntries([[inquiryId, createUnreadConversationState(inquiryId, 0, readAt)]]),
    },
  };
}

export function getConversationUnreadCount(
  conversation: ChatConversationSummary,
): number {
  return Math.max(0, conversation.unreadCount);
}

export function getTotalUnreadCount(
  conversations: readonly ChatConversationSummary[],
): number {
  return conversations.reduce(
    (total, conversation) =>
      total + getConversationUnreadCount(conversation),
    0,
  );
}
