import { Send } from "lucide-react";
import { useState, type FormEvent } from "react";

type MessageComposerProps = {
  disabled?: boolean;
  onSend?: (message: string) => void;
};

export function MessageComposer({
  disabled = false,
  onSend,
}: MessageComposerProps) {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;
    onSend?.(trimmedMessage);
    setMessage("");
  }

  return (
    <form className="admin-chat-composer" onSubmit={handleSubmit}>
      <label htmlFor="admin-chat-message">Reply to customer</label>
      <div className="admin-chat-composer-row">
        <textarea
          id="admin-chat-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Type a reply..."
          rows={2}
          disabled={disabled}
        />
        <button type="submit" disabled={disabled || !message.trim()}>
          <Send size={18} aria-hidden="true" />
          <span>Send</span>
        </button>
      </div>
      <p className="admin-chat-composer-note">
        Static preview only. Replies are not transmitted in Phase 4.
      </p>
    </form>
  );
}
