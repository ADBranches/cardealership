import type { ChatConnectionStatus } from "../types";

type ChatConnectionBannerProps = {
  status: ChatConnectionStatus;
  errorMessage?: string | null;
};

const connectionLabels: Record<ChatConnectionStatus, string> = {
  idle: "Static preview mode",
  connecting: "Connecting to chat. Sending is temporarily unavailable.",
  connected: "Chat connected",
  reconnecting: "Reconnecting to chat. Sending will resume automatically.",
  disconnected: "Chat is offline. Sending is paused while the connection recovers.",
  error: "Chat connection unavailable. Wait for reconnection before sending.",
};

export function ChatConnectionBanner({
  status,
  errorMessage,
}: ChatConnectionBannerProps) {
  return (
    <div
      className={`admin-chat-connection admin-chat-connection-${status}`}
      role={status === "error" ? "alert" : "status"}
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="admin-chat-connection-dot" aria-hidden="true" />
      <span>{errorMessage || connectionLabels[status]}</span>
    </div>
  );
}
