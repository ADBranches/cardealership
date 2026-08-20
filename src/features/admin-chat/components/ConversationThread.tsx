import { ArrowLeft } from "lucide-react";
import { useAdminChat, useConversationSelection } from "../hooks";
import { AdminChatEmptyState } from "./AdminChatEmptyState";
import { ChatConnectionBanner } from "./ChatConnectionBanner";
import { MessageBubble } from "./MessageBubble";
import { MessageComposer } from "./MessageComposer";
import { TypingIndicator } from "./TypingIndicator";

type ConversationThreadProps = {
  onBack: () => void;
};

export function ConversationThread({
  onBack,
}: ConversationThreadProps) {
  const { connectionStatus, isLoadingHistory, error, retry } =
    useAdminChat();
  const { activeConversation, activeMessages, activeTypingEvents } =
    useConversationSelection();

  if (!activeConversation) {
    return (
      <section className="admin-chat-thread-panel admin-chat-thread-empty">
        <AdminChatEmptyState title="Select a conversation" description="Choose a customer inquiry to review its message history." />
      </section>
     );
  }

  const { inquiry } = activeConversation;
  const customerIsTyping = activeTypingEvents.some(
    (event) => event.isTyping && event.role === "customer",
  );

  return (
    <section className="admin-chat-thread-panel" aria-labelledby="admin-chat-thread-title">
      <header className="admin-chat-thread-header">
        <button type="button" className="admin-chat-back-button" onClick={onBack} aria-label="Back to conversation list">
          <ArrowLeft size={20} aria-hidden="true" />
        </button>

        <div className="admin-chat-thread-identity">
          <p className="admin-chat-eyebrow">Active inquiry</p>
          <h2 id="admin-chat-thread-title">{inquiry.customer.name}</h2>
          <p>{inquiry.vehicle?.label || `Inquiry ${inquiry.id}`}</p>
        </div>

        <ChatConnectionBanner
          status={connectionStatus}
          errorMessage={connectionStatus === "error" ? error?.message : null}
        />
      </header>

      <div className="admin-chat-message-history" aria-label="Conversation message history">
        <div className="admin-chat-live-region" aria-live="polite" aria-atomic="false">
          {activeMessages.length > 0 ? `${activeMessages.length} messages loaded` : "No messages loaded"}
        </div>

        {error?.inquiryId === inquiry.id ? (
          <div className="admin-chat-thread-error" role="alert">
            <p>{error.message}</p>
            <button type="button" onClick={retry}>Retry</button>
          </div>
        ) : null}

        {isLoadingHistory ? (
          <p className="admin-chat-history-status" role="status">Loading message history...</p>
        ) : activeMessages.length === 0 ? (
          <AdminChatEmptyState title="No messages yet" description="The conversation history is currently empty." />
        ) : (
          activeMessages.map((message) => (<MessageBubble key={message.id} message={message} />))
        )}

        <TypingIndicator customerName={inquiry.customer.name} isTyping={customerIsTyping} />
      </div>

      <MessageComposer />
    </section>
  );
}
