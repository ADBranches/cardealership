import assert from "node:assert/strict";
import { createUnreadConversationState, getTotalUnreadCount, nextUnreadCount, shouldIncrementUnreadCount } from "../features/admin-chat/state";
import type { ChatConversationSummary, ChatMessage } from "../features/admin-chat/types";

function conversation(inquiryId: string, unreadCount: number): ChatConversationSummary {
  return {
    inquiry: {
      id: inquiryId,
      customer: { id: "customer-" + inquiryId, name: "Synthetic Customer", role: "customer" },
      createdAt: "2026-08-19T10:00:00.000Z",
      updatedAt: "2026-08-19T10:00:00.000Z",
    },
    latestMessage: null,
    unreadCount,
    lastReadAt: null,
  };
}

const customerMessage: ChatMessage = {
  id: "message-001",
  inquiryId: "inquiry-002",
  senderId: "customer-002",
  senderRole: "customer",
  message: "Synthetic customer message",
  createdAt: "2026-08-19T10:01:00.000Z",
};

assert.equal(shouldIncrementUnreadCount("inquiry-001", customerMessage), true);
assert.equal(shouldIncrementUnreadCount("inquiry-002", customerMessage), false);
assert.equal(nextUnreadCount(2, true), 3);
assert.equal(nextUnreadCount(2, false), 2);
assert.equal(nextUnreadCount(-4, false), 0);
assert.equal(createUnreadConversationState("inquiry-001", -3).unreadCount, 0);
assert.equal(getTotalUnreadCount([conversation("inquiry-001", 2), conversation("inquiry-002", 3)]), 5);
assert.equal(getTotalUnreadCount([conversation("inquiry-001", -2)]), 0);

console.log(JSON.stringify({ suite: "unreadChatBadge", passed: 8, failed: 0, totalDerivedFromConversations: true, negativeCountsPrevented: true, syntheticDataUsed: true }, null, 2));
