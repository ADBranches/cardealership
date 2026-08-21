import { Send } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAdminChat } from "../hooks";
import {
  ADMIN_CHAT_MESSAGE_MAX_LENGTH,
  validateAdminChatMessage,
} from "../utils/messageValidation";
import {
  createTypingThrottleController,
  type TypingThrottleController,
} from "../utils/typingThrottle";

export function MessageComposer() {
  const {
    activeInquiryId,
    connectionStatus,
    sendMessage,
    setTyping,
  } = useAdminChat();
  const [message, setMessage] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const typingControllerRef = useRef<TypingThrottleController | null>(null);
  const disabled = !activeInquiryId || connectionStatus !== "connected";

  useEffect(() => {
    if (!activeInquiryId) {
      typingControllerRef.current = null;
      return;
    }

    const createEvent = (isTyping: boolean) => ({
      inquiryId: activeInquiryId,
      userId: "admin-local",
      role: "admin" as const,
      isTyping,
      occurredAt: new Date().toISOString(),
    });
    const controller = createTypingThrottleController({
      onTypingStart: () => setTyping(createEvent(true)),
      onTypingStop: () => setTyping(createEvent(false)),
    });
    typingControllerRef.current = controller;

    return () => {
      controller.dispose();
      typingControllerRef.current = null;
    };
  }, [activeInquiryId, setTyping]);

  function handleMessageChange(value: string) {
    setMessage(value);
    setValidationError(null);
    typingControllerRef.current?.update(value.trim().length > 0);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;

    const validation = validateAdminChatMessage(message);
    if (!validation.valid) {
      setValidationError(validation.error);
      return;
    }

    const result = sendMessage({
      inquiryId: activeInquiryId,
      message: validation.message,
    });
    if (!result.ok) {
      setValidationError(result.error);
      return;
    }

    typingControllerRef.current?.stop();
    setMessage("");
    setValidationError(null);
  }

  return (
    <form className="admin-chat-composer" onSubmit={handleSubmit}>
      <label htmlFor="admin-chat-message">Reply to customer</label>
      <div className="admin-chat-composer-row">
        <textarea
          id="admin-chat-message"
          value={message}
          onChange={(event) => handleMessageChange(event.target.value)}
          placeholder="Type a reply..."
          rows={2}
          maxLength={ADMIN_CHAT_MESSAGE_MAX_LENGTH}
          disabled={disabled}
          aria-describedby="admin-chat-composer-help admin-chat-composer-error"
          aria-invalid={validationError !== null}
        />
        <button
          type="submit"
          disabled={disabled || !message.trim()}
        >
          <Send size={18} aria-hidden="true" />
          <span>Send</span>
        </button>
      </div>
      <div className="admin-chat-composer-meta" id="admin-chat-composer-help">
        <span>
          {disabled
            ? "Reconnect to chat before sending."
            : "Messages are shown as pending until acknowledged."}
        </span>
        <span>{message.length}/{ADMIN_CHAT_MESSAGE_MAX_LENGTH}</span>
      </div>
      <p
        className="admin-chat-composer-error"
        id="admin-chat-composer-error"
        role={validationError ? "alert" : undefined}
      >
        {validationError ?? ""}
      </p>
    </form>
  );
}
