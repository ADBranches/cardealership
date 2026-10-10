import { useCallback } from "react";
import { useAdminChat } from "./useAdminChat";

export function useConversationSelection() {
  const {
    activeInquiryId,
    activeConversation,
    messagesByInquiry,
    typingByInquiry,
    selectConversation,
    loadHistory,
  } = useAdminChat();

  const select = useCallback(
    (inquiryId: string) => {
      selectConversation(inquiryId);
      loadHistory(inquiryId);
    },
    [loadHistory, selectConversation],
  );

  return {
    activeInquiryId,
    activeConversation,
    activeMessages: activeInquiryId
      ? messagesByInquiry[activeInquiryId] ?? []
      : [],
    activeTypingEvents: activeInquiryId
      ? typingByInquiry[activeInquiryId] ?? []
      : [],
    selectConversation: select,
  };
}
