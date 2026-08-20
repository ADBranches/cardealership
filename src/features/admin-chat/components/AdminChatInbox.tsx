import { useMemo, useState } from "react";
import {
  adminChatConversations,
  adminChatMessagesByInquiry,
  adminChatTypingFixture,
} from "../data/adminChatFixtures";
import { orderConversations, orderMessages } from "../state";
import { ConversationList } from "./ConversationList";
import { ConversationThread } from "./ConversationThread";
import "./AdminChatInbox.css";

export function AdminChatInbox() {
  const conversations = useMemo(
    () => orderConversations(adminChatConversations),
    [],
  );
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(
    conversations[0]?.inquiry.id ?? null,
  );
  const [isThreadVisibleOnMobile, setIsThreadVisibleOnMobile] = useState(false);

  const selectedConversation =
    conversations.find(
      (conversation) => conversation.inquiry.id === selectedInquiryId,
    ) ?? null;

  const selectedMessages = selectedInquiryId
    ? orderMessages(adminChatMessagesByInquiry[selectedInquiryId] ?? [])
    : [];

  function handleSelectConversation(inquiryId: string) {
    setSelectedInquiryId(inquiryId);
    setIsThreadVisibleOnMobile(true);
  }

  function handleBackToList() {
    setIsThreadVisibleOnMobile(false);
  }

  const customerIsTyping =
    selectedInquiryId === adminChatTypingFixture.inquiryId &&
    adminChatTypingFixture.isTyping;

  return (
    <main className="admin-chat-page-shell">
      <header className="admin-chat-page-header">
        <div>
          <p className="admin-chat-eyebrow">Sprint 7 static preview</p>
          <h1>Admin inquiry inbox</h1>
          <p>
            Review synthetic customer conversations before live transport integration.
          </p>
        </div>
        <span className="admin-chat-synthetic-label">
          Synthetic development data
        </span>
      </header>

      <div
        className={`admin-chat-layout ${isThreadVisibleOnMobile ? "admin-chat-mobile-thread-visible" : ""}`}
      >
        <ConversationList
          conversations={conversations}
          selectedInquiryId={selectedInquiryId}
          onSelect={handleSelectConversation}
        />
        <ConversationThread
          conversation={selectedConversation}
          messages={selectedMessages}
          isTyping={customerIsTyping}
          onBack={handleBackToList}
        />
      </div>
    </main>
  );
}
