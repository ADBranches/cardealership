type TypingIndicatorProps = {
  customerName: string;
  isTyping: boolean;
};

export function TypingIndicator({ customerName, isTyping }: TypingIndicatorProps) {
  if (!isTyping) return null;

  return (
    <p className="admin-chat-typing" role="status" aria-live="polite">
      <span aria-hidden="true" className="admin-chat-typing-dots">•••</span>
      {customerName} is typing
    </p>
  );
}
