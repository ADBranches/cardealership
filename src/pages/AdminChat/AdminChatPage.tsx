import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AdminChatInbox } from "../../features/admin-chat/components";
import { useAdminChat } from "../../features/admin-chat/hooks";

export function AdminChatPage() {
  const navigate = useNavigate();
  const { loadConversations } = useAdminChat();

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return (
    <div>
      <nav className="admin-chat-page-navigation" aria-label="Admin chat navigation">
        <button type="button" onClick={() => navigate("/Admin")}>
          <ArrowLeft size={18} aria-hidden="true" />
          <span>Admin dashboard</span>
        </button>
      </nav>
      <AdminChatInbox />
    </div>
  );
}
