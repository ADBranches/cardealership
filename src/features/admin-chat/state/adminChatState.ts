import type { AdminChatState, ChatConversationSummary } from "../types";

export function createInitialAdminChatState(): AdminChatState {
  return {
    conversations: [],
    activeInquiryId: null,
    messagesByInquiry: {},
    typingByInquiry: {},
    unreadByInquiry: {},
    connectionStatus: "idle",
    isLoadingConversations: false,
    isLoadingHistory: false,
    error: null,
  };
}

export function getActiveConversation(
  state: AdminChatState,
): ChatConversationSummary | null {
  if (!state.activeInquiryId) return null;

  return (
    state.conversations.find(
      (conversation) => conversation.inquiry.id === state.activeInquiryId,
    ) ?? null
  );
}
