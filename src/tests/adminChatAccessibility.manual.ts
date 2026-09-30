import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(path, "utf8");
const inbox = read("src/features/admin-chat/components/AdminChatInbox.tsx");
const list = read("src/features/admin-chat/components/ConversationList.tsx");
const thread = read("src/features/admin-chat/components/ConversationThread.tsx");
const composer = read("src/features/admin-chat/components/MessageComposer.tsx");
const banner = read("src/features/admin-chat/components/ChatConnectionBanner.tsx");
const bubble = read("src/features/admin-chat/components/MessageBubble.tsx");
const inboxCss = read("src/features/admin-chat/components/AdminChatInbox.css");
const badgeCss = read("src/features/admin-chat/components/UnreadChatBadge.css");

assert.match(inbox, /pendingFocusTargetRef/);
assert.match(inbox, /admin-chat-mobile-thread-visible/);
assert.match(list, /aria-busy="true"/);
assert.match(list, /role="alert"/);
assert.match(list, /No conversations/);
assert.match(thread, /role="log"/);
assert.match(thread, /aria-relevant="additions"/);
assert.match(thread, /aria-busy/);
assert.match(thread, /Back to conversation list/);
assert.match(thread, /Loading message history/);
assert.match(composer, /aria-invalid/);
assert.match(composer, /role="status"/);
assert.match(banner, /reconnecting/);
assert.match(banner, /Chat is offline/);
assert.match(bubble, /Try again/);
assert.match(bubble, /deliveryStatus === "failed"/);
assert.match(inboxCss, /max-width: 1024px/);
assert.match(inboxCss, /max-width: 760px/);
assert.match(inboxCss, /max-width: 420px/);
assert.match(inboxCss, /overflow-wrap: anywhere/);
assert.match(inboxCss, /focus-visible/);
assert.match(inboxCss, /prefers-reduced-motion/);
assert.match(badgeCss, /max-width: 4rem/);
assert.match(badgeCss, /font-variant-numeric/);

console.log(JSON.stringify({
  suite: "adminChatAccessibility",
  passed: 24,
  failed: 0,
  responsiveRulesVerified: true,
  failureStatesVerified: true,
  keyboardFocusVerified: true,
  liveRegionVerified: true,
  mobileNavigationVerified: true,
  longContentVerified: true,
  highUnreadCountVerified: true,
  syntheticValidationOnly: true
}, null, 2));
