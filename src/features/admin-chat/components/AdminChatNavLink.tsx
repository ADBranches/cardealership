import { NavLink } from "react-router-dom";
import { useAdminChat } from "../hooks";
import { UnreadChatBadge } from "./UnreadChatBadge";

export function AdminChatNavLink() {
  const { totalUnreadCount } = useAdminChat();

  return (
    <NavLink
      to="/Admin/chat"
      className={({ isActive }) =>
        `admin-chat-nav-link${isActive ? " admin-chat-nav-link-active" : ""}`
      }
      aria-label="Open protected customer chat inbox"
    >
      <span className="admin-chat-nav-link-copy">
        <span className="admin-chat-nav-link-title">Customer Inbox</span>
        <span className="admin-chat-nav-link-description">
          Review customer vehicle inquiries
        </span>
      </span>
      <UnreadChatBadge count={totalUnreadCount} />
    </NavLink>
  );
}
