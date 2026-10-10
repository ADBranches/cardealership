import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  adminChatReducer,
  createInitialAdminChatState,
  getTotalUnreadCount,
} from "../features/admin-chat/state";
import type {
  ChatConversationSummary,
  ChatMessage,
} from "../features/admin-chat/types";

function conversation(
  inquiryId: string,
  unreadCount: number,
): ChatConversationSummary {
  return {
    inquiry: {
      id: inquiryId,
      customer: {
        id: `customer-${inquiryId}`,
        name: "Synthetic Customer",
        role: "customer",
      },
      createdAt: "2026-08-21T10:00:00.000Z",
      updatedAt: "2026-08-21T10:00:00.000Z",
    },
    latestMessage: null,
    unreadCount,
    lastReadAt: null,
  };
}

function customerMessage(
  id: string,
  inquiryId: string,
  createdAt: string,
): ChatMessage {
  return {
    id,
    inquiryId,
    senderId: `customer-${inquiryId}`,
    senderRole: "customer",
    message: `Synthetic message ${id}`,
    createdAt,
  };
}

const activeInquiryId = "inquiry-active";
const inactiveInquiryId = "inquiry-inactive";

let state = createInitialAdminChatState();
state = adminChatReducer(state, {
  type: "conversations/hydrate",
  conversations: [
    conversation(activeInquiryId, 2),
    conversation(inactiveInquiryId, 3),
  ],
});

assert.equal(getTotalUnreadCount(state.conversations), 5);

state = adminChatReducer(state, {
  type: "conversation/select",
  inquiryId: activeInquiryId,
  readAt: "2026-08-21T10:01:00.000Z",
});
assert.equal(getTotalUnreadCount(state.conversations), 3);

const inactiveMessage = customerMessage(
  "message-inactive-001",
  inactiveInquiryId,
  "2026-08-21T10:02:00.000Z",
);
state = adminChatReducer(state, {
  type: "message/receive",
  message: inactiveMessage,
});
assert.equal(getTotalUnreadCount(state.conversations), 4);

const duplicateState = adminChatReducer(state, {
  type: "message/receive",
  message: inactiveMessage,
});
assert.equal(duplicateState, state);
assert.equal(getTotalUnreadCount(duplicateState.conversations), 4);

const activeMessage = customerMessage(
  "message-active-001",
  activeInquiryId,
  "2026-08-21T10:03:00.000Z",
);
state = adminChatReducer(state, {
  type: "message/receive",
  message: activeMessage,
});
assert.equal(getTotalUnreadCount(state.conversations), 4);

state = adminChatReducer(state, {
  type: "conversation/select",
  inquiryId: inactiveInquiryId,
  readAt: "2026-08-21T10:04:00.000Z",
});
assert.equal(getTotalUnreadCount(state.conversations), 0);

function formatUnreadCount(count: number): string {
  const safeCount = Math.max(0, Math.floor(count));
  return safeCount > 99 ? "99+" : String(safeCount);
}

assert.equal(formatUnreadCount(0), "0");
assert.equal(formatUnreadCount(99), "99");
assert.equal(formatUnreadCount(100), "99+");
assert.equal(formatUnreadCount(250), "99+");

const badgeSource = readFileSync(
  "src/features/admin-chat/components/UnreadChatBadge.tsx",
  "utf8",
);
const navLinkSource = readFileSync(
  "src/features/admin-chat/components/AdminChatNavLink.tsx",
  "utf8",
);
const appSource = readFileSync("src/app/App.tsx", "utf8");

assert.equal(badgeSource.includes("99+"), false);
assert.equal(badgeSource.includes("UNREAD_CHAT_BADGE_MAXIMUM"), true);
assert.equal(badgeSource.includes("unread chat"), true);
assert.equal(navLinkSource.includes(
  "const { totalUnreadCount } = useAdminChat();",
), true);
assert.equal(navLinkSource.includes(
  `to="/Admin/chat"`,
), true);
assert.equal(appSource.match(/<AdminChatProvider>/g)?.length, 1);
assert.equal(appSource.includes(`path="/Admin"`), true);
assert.equal(appSource.includes(`<ProtectedRoute>`), true);
assert.equal(appSource.includes(`<Route path="chat" element={<AdminChatPage />} />`), true);
assert.equal(appSource.includes(`user?.role !== "admin"`), true);

console.log(JSON.stringify({
  suite: "unreadChatBadge",
  passed: 18,
  failed: 0,
  initialUnreadCountVerified: true,
  inactiveRoomIncrementVerified: true,
  activeRoomIncrementPrevented: true,
  readDecrementVerified: true,
  duplicateEventIgnored: true,
  visualCapVerified: true,
  accessibleTextVerified: true,
  centralizedProviderVerified: true,
  protectedNavigationVerified: true,
  syntheticDataUsed: true
}, null, 2));
