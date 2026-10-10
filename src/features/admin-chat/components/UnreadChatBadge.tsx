import "./UnreadChatBadge.css";

export const UNREAD_CHAT_BADGE_MAXIMUM = 99;

export function formatUnreadChatCount(count: number): string {
  const safeCount = Math.max(0, Math.floor(count));
  return safeCount > UNREAD_CHAT_BADGE_MAXIMUM
    ? `${UNREAD_CHAT_BADGE_MAXIMUM}+`
    : String(safeCount);
}

type UnreadChatBadgeProps = {
  count: number;
};

export function UnreadChatBadge({ count }: UnreadChatBadgeProps) {
  const safeCount = Math.max(0, Math.floor(count));

  if (safeCount === 0) return null;

  const noun = safeCount === 1 ? "message" : "messages";

  return (
    <span className="admin-chat-nav-badge-wrapper">
      <span className="admin-chat-nav-badge" aria-hidden="true">
        {formatUnreadChatCount(safeCount)}
      </span>
      <span className="admin-chat-visually-hidden">
        {safeCount} unread chat {noun}
      </span>
    </span>
  );
}
