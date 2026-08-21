import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getSafeRedirectPath } from "../app/components/auth/routeAccess";
import {
  createChatSocket,
  getAdminConversations,
  getConversationHistory,
  isChatApiMockMode,
  markConversationRead,
  normalizeIncomingMessage,
} from "../features/admin-chat/services";

const syntheticAdminToken = "synthetic-security-token";
const appSource = readFileSync("src/app/App.tsx", "utf8");
const contextSource = readFileSync("src/features/admin-chat/context/AdminChatContext.tsx", "utf8");
const bubbleSource = readFileSync("src/features/admin-chat/components/MessageBubble.tsx", "utf8");
const hookSource = readFileSync("src/features/admin-chat/hooks/useChatSocket.ts", "utf8");
const chatSource = [
  readFileSync("src/features/admin-chat/services/chatApi.ts", "utf8"),
  readFileSync("src/features/admin-chat/services/chatSocket.ts", "utf8"),
  contextSource,
  bubbleSource,
  hookSource,
].join("\n");

assert.equal(appSource.includes('user?.role !== "admin"'), true);
assert.equal(appSource.match(/<AdminChatProvider>/g)?.length, 1);
assert.equal(contextSource.includes('const isAuthorizedAdmin = user?.role === "admin"'), true);
await assert.rejects(() => getAdminConversations("", { mockMode: true }));
await assert.rejects(() => getConversationHistory("inquiry-001", "", {}, { mockMode: true }));
await assert.rejects(() => markConversationRead("inquiry-001", "", { mockMode: true }));
const conversations = await getAdminConversations(syntheticAdminToken, { mockMode: true });
assert.equal(conversations.length > 0, true);
assert.throws(() => createChatSocket({
  gatewayUrl: "mock://approved-chat-gateway",
  transport: "mock",
  mockMode: true,
  authentication: { accessToken: "" },
}));
assert.equal(isChatApiMockMode("true", true), false);
assert.equal(isChatApiMockMode("true", false), true);

const normalized = normalizeIncomingMessage({
  id: "security-message-001",
  inquiryId: "inquiry-001",
  senderId: "customer-001",
  senderRole: "customer",
  message: "<script>plain text only</script>",
  createdAt: "2026-08-21T12:00:00.000Z",
  unexpectedPrivateField: "discard-me",
});
assert.equal(normalized.message, "<script>plain text only</script>");
assert.equal("unexpectedPrivateField" in normalized, false);
assert.throws(() => normalizeIncomingMessage({}));
assert.equal(bubbleSource.includes("<p>{message.message}</p>"), true);
assert.equal(/dangerouslySetInnerHTML|innerHTML|eval\(|new Function/.test(chatSource), false);
assert.equal(/localStorage|sessionStorage|indexedDB|document\.cookie/.test(chatSource), false);
assert.equal(/console\.(log|debug|info|warn|error)/.test(chatSource), false);
assert.equal(hookSource.includes("adapter.disconnect();"), true);
assert.equal(getSafeRedirectPath("https://malicious.example", "/"), "/");
assert.equal(getSafeRedirectPath("//malicious.example", "/Admin"), "/Admin");

console.log(JSON.stringify({
  suite: "chatSecurity",
  passed: 20,
  failed: 0,
  adminOnlyRouteVerified: true,
  nonAdminProviderBlocked: true,
  unauthenticatedApiBlocked: true,
  socketTokenRequired: true,
  productionMockBlocked: true,
  unexpectedFieldsIgnored: true,
  messageRenderedAsText: true,
  diagnosticSecretsAbsent: true,
  chatBrowserPersistenceAbsent: true,
  logoutTeardownVerified: true,
  externalRedirectBlocked: true,
  syntheticDataUsed: true,
}, null, 2));
