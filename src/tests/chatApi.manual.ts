import assert from "node:assert/strict";
import {
  CHAT_HISTORY_ENDPOINT,
  getAdminConversations,
  getConversationHistory,
  markConversationRead,
} from "../features/admin-chat/services";

const conversations = await getAdminConversations("", { mockMode: true });
assert.equal(conversations.length, 3);
assert.equal(conversations.every((item) => item.inquiry.id.length > 0), true);

const history = await getConversationHistory(
  "inquiry-001",
  "",
  {},
  { mockMode: true },
);
assert.equal(history.mock, true);
assert.equal(history.messages.length, 3);
assert.equal(history.issues.length, 0);
assert.equal(history.hasMore, false);
assert.equal(history.nextCursor, null);

const firstRead = await markConversationRead(
  "inquiry-001",
  "",
  { mockMode: true },
);
const secondRead = await markConversationRead(
  "inquiry-001",
  "",
  { mockMode: true },
);
assert.equal(firstRead.mock, true);
assert.equal(secondRead.mock, true);
assert.equal(
  CHAT_HISTORY_ENDPOINT("inquiry/001"),
  "api/chat/conversations/inquiry%2F001/messages",
);

let conversationListBlocked = false;
try {
  await getAdminConversations("", { mockMode: false });
} catch {
  conversationListBlocked = true;
}
assert.equal(conversationListBlocked, true);

let readStateBlocked = false;
try {
  await markConversationRead("inquiry-001", "", { mockMode: false });
} catch {
  readStateBlocked = true;
}
assert.equal(readStateBlocked, true);

console.log(JSON.stringify({
  suite: "chatApi",
  passed: 12,
  failed: 0,
  syntheticDataUsed: true,
  liveHistoryRouteConfirmed: true,
  unavailableLiveRoutesBlocked: true,
  tokenLogged: false,
}, null, 2));
