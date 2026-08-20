import { Search } from "lucide-react";
import { useAdminChat, useConversationSelection } from "../hooks";
import { AdminChatEmptyState } from "./AdminChatEmptyState";
import { ConversationListItem } from "./ConversationListItem";

type ConversationListProps = {
  onConversationOpened?: () => void;
};

export function ConversationList({
  onConversationOpened,
}: ConversationListProps) {
  const { conversations, isLoadingConversations, error, retry } =
    useAdminChat();
  const { activeInquiryId, selectConversation } =
    useConversationSelection();

  function handleSelect(inquiryId: string) {
    selectConversation(inquiryId);
    onConversationOpened?.();
  }

  if (isLoadingConversations) {
    return (
      <div className="admin-chat-list-status" role="status" aria-live="polite">
        Loading conversations...
      </div>
    );
  }

  return (
    <section className="admin-chat-list-panel" aria-labelledby="admin-chat-list-title">
      <header className="admin-chat-list-header">
        <div>
          <p className="admin-chat-eyebrow">Customer support</p>
          <h2 id="admin-chat-list-title">Conversations</h2>
        </div>
        <span className="admin-chat-list-count">{conversations.length}</span>
      </header>

      <div className="admin-chat-search-shell">
        <Search size={18} aria-hidden="true" />
        <input type="search" placeholder="Search conversations" aria-label="Search conversations" disabled />
      </div>

      {error && !error.inquiryId ? (
        <div className="admin-chat-list-error" role="alert">
          <p>{error.message}</p>
          <button type="button" onClick={retry}>Retry</button>
        </div>
      ) : null}

      {conversations.length === 0 ? (
        <AdminChatEmptyState title="No conversations" description="New customer inquiries will appear here." />
      ) : (
        <ul className="admin-chat-conversation-list" aria-label="Customer conversations">
          {conversations.map((conversation) => (
            <ConversationListItem
              key={conversation.inquiry.id}
              conversation={conversation}
              isSelected={conversation.inquiry.id === activeInquiryId}
              onSelect={handleSelect}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
