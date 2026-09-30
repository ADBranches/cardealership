import type { ChatConversationSummary } from "../types";

type ConversationListItemProps = {
  conversation: ChatConversationSummary;
  isSelected: boolean;
  onSelect: (inquiryId: string) => void;
};

function formatConversationTime(value: string | undefined): string {
  if (!value) return "No messages";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Time unavailable";
  return parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ConversationListItem({
  conversation,
  isSelected,
  onSelect,
}: ConversationListItemProps) {
  const { inquiry, latestMessage, unreadCount } = conversation;

  return (
    <li>
      <button
        type="button"
        className={`admin-chat-conversation-item ${isSelected ? "admin-chat-conversation-selected" : ""}`}
        onClick={() => onSelect(inquiry.id)}
        aria-current={isSelected ? "true" : undefined}
        aria-label={`${inquiry.customer.name}, ${inquiry.vehicle?.label || "vehicle inquiry"}, ${unreadCount} unread messages`}
      >
        <span className="admin-chat-conversation-heading">
          <strong>{inquiry.customer.name}</strong>
          <time dateTime={latestMessage?.createdAt || inquiry.updatedAt}>
            {formatConversationTime(latestMessage?.createdAt || inquiry.updatedAt)}
          </time>
        </span>
        <span className="admin-chat-vehicle-label">
          {inquiry.vehicle?.label || `Inquiry ${inquiry.id}`}
        </span>
        <span className="admin-chat-conversation-preview">
          <span>{latestMessage?.message || "No messages yet"}</span>
          {unreadCount > 0 ? (
            <span className="admin-chat-unread-badge" aria-label={`${unreadCount} unread messages`}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </span>
      </button>
    </li>
  );
}
