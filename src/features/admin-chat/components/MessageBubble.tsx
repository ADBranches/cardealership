import type { ChatMessage } from "../types";

type MessageBubbleProps = {
  message: ChatMessage;
  onRetry?: (inquiryId: string, clientMessageId: string) => void;
};

const deliveryLabels = {
  pending: "Sending",
  sent: "Sent",
  delivered: "Delivered",
  failed: "Not sent",
} as const;

function formatMessageTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Time unavailable";
  return parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function MessageBubble({ message, onRetry }: MessageBubbleProps) {
  const isAdmin = message.senderRole === "admin";
  const canRetry =
    isAdmin &&
    message.deliveryStatus === "failed" &&
    Boolean(message.clientMessageId) &&
    Boolean(onRetry);

  return (
    <article
      className={`admin-chat-message ${isAdmin ? "admin-chat-message-admin" : "admin-chat-message-customer"}`}
      aria-label={`${isAdmin ? "Admin" : "Customer"} message sent at ${formatMessageTime(message.createdAt)}`}
    >
      <p>{message.message}</p>
      <footer>
        <time dateTime={message.createdAt}>{formatMessageTime(message.createdAt)}</time>
        {message.deliveryStatus && isAdmin ? (
          <span
            className={`admin-chat-delivery-status admin-chat-delivery-${message.deliveryStatus}`}
            role="status"
          >
            {deliveryLabels[message.deliveryStatus]}
          </span>
        ) : null}
        {canRetry ? (
          <button
            type="button"
            className="admin-chat-message-retry"
            onClick={() => onRetry?.(message.inquiryId, message.clientMessageId!)}
          >
            Try again
          </button>
        ) : null}
      </footer>
    </article>
  );
}
