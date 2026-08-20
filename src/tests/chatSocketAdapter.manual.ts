import { strict as assert } from "node:assert";
import { MockChatSocket, normalizeIncomingMessage } from "../features/admin-chat/services";

const SENSITIVE_TOKEN = "synthetic-token-that-must-not-leak";
const delay = (milliseconds: number) =>
  new Promise<void>(( resolve ) => setTimeout(resolve, milliseconds));

const socket = new MockChatSocket({
  gatewayUrl: "mock://approved-chat-gateway",
  transport: "mock",
  mockMode: true,
  authentication: { accessToken: SENSITIVE_TOKEN },
  reconnectDelayMilliseconds: 1,
});

const connectionStates: string[] = [];
const messages: unknown[] = [];
const acknowledgements: unknown[] = [];
const errors: string[] = [];

const unsubscribes = [
  socket.on("connection", (status) => connectionStates.push(status)),
  socket.on("message", (message) => messages.push(message)),
  socket.on("acknowledgement", (ack) => acknowledgements.push(ack")),
  socket.on("error", (error) => errors.push(error.message)),
];

socket.connect();
await delay(1);
assert.equal(socket.gatewayUrl, "mock://approved-chat-gateway");

const inspectionAfterConnect = socket.getInspection();
assert.equal(inspectionAfterConnect.authenticationAttached, true);

socket.joinRoom({ inquiryId: "inquiry-001" });
assert.deepEqual(socket.getJoinedRooms(), ["inquiry-001"]);

const incoming = normalizeIncomingMessage({
  id: "message-incoming",
  inquiryId: "inquiry-001",
  senderId: "customer-001",
  senderRole: "customer",
  message: "Synthetic incoming message",
  createdAt: "2026-08-20T09:00:00.000Z",
  deliveryStatus: "delivered",
});
socket.simulateIncomingMessage(incoming);
assert.equal((messages[0] as typeof incoming).id, "message-incoming");

socket.sendReply({
  inquiryId: "inquiry-001",
  message: "Synthetic admin reply",
  clientMessageId: "client-001",
  sentAt: "2026-08-20T09:01:00.000Z",
});
await delay(1);
assert.equal(socket.getInspection().sentReplies[0].clientMessageId, "client-001");
assert.equal(acknowledgements.length, 1);

const listenerCountBeforeReconnect = socket.getListenerCount();
socket.simulateReconnect();
await delay(2);
assert.equal(socket.getListenerCount(), listenerCountBeforeReconnect);

for (const unsubscribe of unsubscribes) unsubscribe();
assert.equal(socket.getListenerCount(), 0);

const serializedInspection = JSON.stringify(socket.getInspection());
const serializedErrors = JSON.stringify(errors);
assert.equal(serializedInspection.includes(SENSITIVE_TOKEN), false);
assert.equal(serializedErrors.includes(SENSITIVE_TOKEN), false);
socket.disconnect();

console.log(JSON.stringify({
  suite: "chatSocketAdapter",
  passed: 8,
  failed: 0,
  mockTransportUsed: true,
  expectedUrlUsed: true,
  authenticationAttached: true,
  joinRoomPayloadVerified: true,
  incomingMessageNormalized: true,
  adminReplyVerified: true,
  listenerCleanupVerified: true,
  reconnectDeduplicationVerified: true,
  tokenExposed: false,
}, null, 2));
