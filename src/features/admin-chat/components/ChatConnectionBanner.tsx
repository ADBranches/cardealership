import type { ChatConnectionStatus } from "../types";

type ChatConnectionBannerProps = {
  status: ChatConnectionStatus;
  errorMessage?: string | null;
};

const connectionLabels: Record<ChatConnectionStatus, string> = {
  idle: "Static preview mode",
  connecting: "Connecting to chat",
  connected: "Chat connected",
  reconnecting: "Reconnecting to chat",
  disconnected: "Chat is disconnected",
  error: "Chat connection unavailable",
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
    >
      <span className="admin-chat-connection-dot" aria-hidden="true" />
      <span>{errorMessage || connectionLabels[status]}</span>
    </div>
  );
}
