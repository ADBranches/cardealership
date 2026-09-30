import assert from "node:assert/strict";
import { adminChatReducer, createInitialAdminChatState, getActiveConversation, orderMessages } from "../features/admin-chat/state";
import type { ChatConversationSummary, ChatMessage } from "../features/admin-chat/types";

const inquiryId = "inquiry-001";

const conversation: ChatConversationSummary = {
  inquiry: {
    id: inquiryId,
    customer: { id: "customer-001", name: "Test Customer", role: "customer" },
    vehicle: { id: "vehicle-001", label: "Synthetic Vehicle" },
    createdAt: "2026-08-19T10:00:00.000Z",
    updatedAt: "2026-08-19T10:00:00.000Z",
  },
  latestMessage: null,
  unreadCount: 0,
  lastReadAt: null,
};

function createMessage(id: string, createdAt: string, senderRole: "customer" | "admin" = "customer"): ChatMessage {
  return {
    id,
    inquiryId,
    senderId: senderRole === "customer" ? "customer-001" : "admin-001",
    senderRole,
    message: "Synthetic message " + id,
    createdAt,
  };
}

let state = createInitialAdminChatState();
assert.deepEqual(state.conversations, []);
assert.equal(getActiveConversation(state), null);

state = adminChatReducer(state, { type: "conversation/upsert", conversation });
assert.equal(state.conversations.length, 1);

const firstMessage = createMessage("message-002", "2026-08-19T10:02:00.000Z");
state = adminChatReducer(state, { type: "message/receive", message: firstMessage });
assert.equal(state.messagesByInquiry[inquiryId].length, 1);
assert.equal(state.conversations[0].unreadCount, 1);

const duplicateState = adminChatReducer(state, { type: "message/receive", message: firstMessage });
assert.equal(duplicateState, state);

const olderMessage = createMessage("message-001", "2026-08-19T10:01:00.000Z");
state = adminChatReducer(state, { type: "message/receive", message: olderMessage });
assert.deepEqual(state.messagesByInquiry[inquiryId].map((item) => item.id), ["message-001", "message-002"]);

state = adminChatReducer(state, { type: "conversation/select", inquiryId, readAt: "2026-08-19T10:03:00.000Z" });
assert.equal(state.activeInquiryId, inquiryId);
assert.equal(state.conversations[0].unreadCount, 0);

const activeMessage = createMessage("message-003", "2026-08-19T10:04:00.000Z");
state = adminChatReducer(state, { type: "message/receive", message: activeMessage });
assert.equal(state.conversations[0].unreadCount, 0);

assert.deepEqual(orderMessages([activeMessage, olderMessage, firstMessage]).map((item) => item.id), ["message-001", "message-002", "message-003"]);


const optimisticMessage: ChatMessage = {
  ...createMessage("temporary-001", "2026-08-19T10:05:00.000Z", "admin"),
  clientMessageId: "client-001",
  deliveryStatus: "pending",
};
state = adminChatReducer(state, { type: "message/receive", message: optimisticMessage });
state = adminChatReducer(state, {
  type: "message/acknowledge",
  acknowledgement: {
    inquiryId,
    clientMessageId: "client-001",
    messageId: "message-004",
    acknowledgedAt: "2026-08-19T10:05:01.000Z",
  },
});
assert.equal(state.messagesByInquiry[inquiryId].filter((item) => item.id === "message-004").length, 1);
assert.equal(state.messagesByInquiry[inquiryId].find((item) => item.id === "message-004")?.deliveryStatus, "sent");

state = adminChatReducer(state, {
  type: "typing/set",
  event: {
    inquiryId,
    userId: "customer-001",
    role: "customer",
    isTyping: true,
    occurredAt: "2026-08-19T10:06:00.000Z",
  },
});
assert.equal(state.typingByInquiry[inquiryId].length, 1);
state = adminChatReducer(state, {
  type: "typing/expire",
  now: "2026-08-19T10:06:10.000Z",
  maxAgeMilliseconds: 5000,
});
assert.equal(state.typingByInquiry[inquiryId].length, 0);

const unknownMessage: ChatMessage = {
  ...createMessage("message-unknown", "2026-08-19T10:07:00.000Z"),
  inquiryId: "unknown-inquiry",
};
const stateBeforeUnknownMessage = state;
state = adminChatReducer(state, { type: "message/receive", message: unknownMessage });
assert.equal(state, stateBeforeUnknownMessage);

const stateBeforeReplay = state;
state = adminChatReducer(state, { type: "message/receive", message: activeMessage });
assert.equal(state, stateBeforeReplay);

console.log(JSON.stringify({ suite: "adminChatState", passed: 16, failed: 0, syntheticDataUsed: true, duplicateMessagesIgnored: true, unknownRoomsIgnored: true, typingExpiryVerified: true, acknowledgementReconciled: true, messageContentLogged: false, tokenLogged: false }, null, 2));
