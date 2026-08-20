import { ArrowLeft } from "lucide-react";
import type { ChatConversationSummary, ChatMessage } from "../types";
import { AdminChatEmptyState } from "./AdminChatEmptyState";
import { ChatConnectionBanner } from "./ChatConnectionBanner";
import { MessageBubble } from "./MessageBubble";
import { MessageComposer } from "./MessageComposer";
import { TypingIndicator } from "./TypingIndicator";

type ConversationThreadProps = {
  conversation: ChatConversationSummary | null;
  messages: ChatMessage[];
  isTyping?: boolean;
  onBack: () => void;
};

export function ConversationThread({
  conversation,
  messages,
  isTyping = false,
  onBack,
}: ConversationThreadProps) {
  if (!conversation) {
    return (
      <section className="admin-chat-thread-panel admin-chat-thread-empty">
        <AdminChatEmptyState
          title="Select a conversation"
          description="Choose a customer inquiry to review its message history."
        />
      </section>
    );
  }

  const { inquiry } = conversation;

  return (
    <section className="admin-chat-thread-panel" aria-labelledby="admin-chat-thread-title">
      <header className="admin-chat-thread-header">
        <button
          type="button"
          className="admin-chat-back-button"
          onClick={onBack}
          aria-label="Back to conversation list"
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <div className="admin-chat-thread-identity">
          <p className="admin-chat-eyebrow">Active inquiry</p>
          <h2 id="admin-chat-thread-title">{inquiry.customer.name}</h2>
          <p>{inquiry.vehicle?.label || `Inquiry ${inquiry.id}`}</p>
        </div>
        <ChatConnectionBanner status="idle" />
      </header>

      <div className="admin-chat-message-history" aria-label="Conversation message history">
        <div className="admin-chat-live-region" aria-live="polite" aria-atomic="false">
          {messages.length > 0 ? `${messages.length} messages loaded` : "No messages loaded"}
        </div>
        {messages.length === 0 ? (
          <AdminChatEmptyState
            title="No messages yet"
            description="The conversation history is currently empty."
          />
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        <TypingIndicator
          customerName={inquiry.customer.name}
          isTyping={isTyping}
        />
      </div>

      <MessageComposer />
    </section>
  );
}
