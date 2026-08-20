import { Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAdminChat } from "../hooks";

export function MessageComposer() {
  const {
    activeInquiryId,
    connectionStatus,
    sendMessage,
  } = useAdminChat();
  const [message, setMessage] = useState("");

  const disabled =
    !activeInquiryId ||
    connectionStatus === "disconnected" ||
    connectionStatus === "error";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;

    sendMessage({
      inquiryId: activeInquiryId,
      message: trimmedMessage,
    });
    setMessage("");
  }

  return (
    <form className="admin-chat-composer" onSubmit={handleSubmit}>
      <label htmlFor="admin-chat-message">
        Reply to customer
      </label>

      <div className="admin-chat-composer-row">
        <textarea
          id="admin-chat-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Type a reply..."
          rows={2}
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={disabled || !message.trim()}
        >
          <Send size={18} aria-hidden="true" />
          <span>Send</span>
        </button>
      </div>

      <p className="admin-chat-composer-note">
        Messages are stored optimistically in shared local state.
      </p>
    </form>
  );
}
