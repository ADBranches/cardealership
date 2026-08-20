import { useState } from "react";
import { useAdminChat } from "../hooks";
import { ConversationList } from "./ConversationList";
import { ConversationThread } from "./ConversationThread";
import "./AdminChatInbox.css";

export function AdminChatInbox() {
  const { totalUnreadCount } = useAdminChat();
  const [isThreadVisibleOnMobile, setIsThreadVisibleOnMobile] = useState(false);

  function handleConversationOpened() {
    setIsThreadVisibleOnMobile(true);
  }

  function handleBackToList() {
    setIsThreadVisibleOnMobile(false);
  }

  return (
    <main className="admin-chat-page-shell">
      <header className="admin-chat-page-header">
        <div>
          <p className="admin-chat-eyebrow">Sprint 7 shared state preview</p>
          <h1>Admin inquiry inbox</h1>
          <p>
            Review synthetic customer conversations through one shared chat provider.
          </p>
        </div>
        <div className="admin-chat-header-status">
          <span
            className="admin-chat-unread-summary"
            aria-label={`${totalUnreadCount} total unread messages`}
          >
            {totalUnreadCount} unread
          </span>
          <span className="admin-chat-synthetic-label">
            Synthetic development data
          </span>
        </div>
      </header>

      <div
        className={`admin-chat-layout ${
          isThreadVisibleOnMobile
            ? "admin-chat-mobile-thread-visible"
            : ""
        }`}
      >
        <ConversationList onConversationOpened={handleConversationOpened} />
        <ConversationThread onBack={handleBackToList} />
      </div>
    </main>
  );
}
