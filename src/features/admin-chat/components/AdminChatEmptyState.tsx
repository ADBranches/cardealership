import { MessageSquareText } from "lucide-react";

type AdminChatEmptyStateProps = {
  title: string;
  description: string;
};

export function AdminChatEmptyState({
  title,
  description,
}: AdminChatEmptyStateProps) {
  return (
    <section className="admin-chat-empty-state" aria-labelledby="admin-chat-empty-title">
      <MessageSquareText aria-hidden="true" size={36} />
      <h2 id="admin-chat-empty-title">{title}</h2>
      <p>{description}</p>
    </section>
  );
}
