import type { ChatMessage } from "../types";

type MessageBubbleProps = {
  message: ChatMessage;
};

function formatMessageTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Time unavailable";
  return parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isAdmin = message.senderRole === "admin";

  return (
    <article
      className={`admin-chat-message ${isAdmin ? "admin-chat-message-admin" : "admin-chat-message-customer"}`}
      aria-label={`${isAdmin ? "Admin" : "Customer"} message sent at ${formatMessageTime(message.createdAt)}`}
    >
      <p>{message.message}</p>
      <footer>
        <time dateTime={message.createdAt}>{formatMessageTime(message.createdAt)}</time>
        {message.deliveryStatus && isAdmin ? (
          <span className="admin-chat-delivery-status">{message.deliveryStatus}</span>
        ) : null}
      </footer>
    </article>
  );
}
