import assert from "node:assert/strict";
import { mergeChatHistory, normalizeChatHistory } from "../features/admin-chat/services";
import type { ChatMessage } from "../features/admin-chat/types";

const normalized = normalizeChatHistory({
  messages: [
    {
      id: "stored-002",
      conversation_id: "inquiry-001",
      sender: "customer",
      message: "Second stored message",
      created_at: "2026-08-20T10:02:00.000Z"
    },
    {
      id: "stored-001",
      conversation_id: "inquiry-001",
      sender: "admin",
      message: "First stored message",
      created_at: "2026-08-20T10:01:00.000Z",
      client_message_id: "client-001"
    },
    {
      id: "",
      conversation_id: "inquiry-001",
      sender: "customer",
      message: "Malformed record",
      created_at: "invalid-date"
    }
  ]
}, "inquiry-001");

assert.deepEqual(normalized.messages.map((item) => item.id), ["stored-001", "stored-002"]);
assert.equal(normalized.issues.length, 1);
assert.equal(normalized.issues[0].code, "MALFORMED_CHAT_RECORD");

const optimistic: ChatMessage = {
  id: "temporary-001",
  inquiryId: "inquiry-001",
  senderId: "admin-local",
  senderRole: "admin",
  message: "First stored message",
  createdAt: "2026-08-20T10:00:59.000Z",
  clientMessageId: "client-001",
  deliveryStatus: "pending"
};

const liveMessage: ChatMessage = {
  id: "live-003",
  inquiryId: "inquiry-001",
  senderId: "customer-001",
  senderRole: "customer",
  message: "Newer live message",
  createdAt: "2026-08-20T10:03:00.000Z",
  deliveryStatus: "delivered"
};

const merged = mergeChatHistory(normalized.messages, [optimistic, liveMessage]);
assert.equal(merged.some((item) => item.id === "temporary-001"), false);
assert.equal(merged.some((item) => item.id === "stored-001"), true);
assert.equal(merged.some((item) => item.id === "live-003"), true);
assert.deepEqual(merged.map((item) => item.id), ["stored-001", "stored-002", "live-003"]);
assert.equal(mergeChatHistory(merged, merged).length, 3);

console.log(JSON.stringify({
  suite: "chatHistoryMerge",
  passed: 8,
  failed: 0,
  malformedRecordsSkipped: true,
  optimisticMessagesReconciled: true,
  newerLiveMessagesPreserved: true,
  chronologicalOrderPreserved: true,
  syntheticDataUsed: true
}, null, 2));
