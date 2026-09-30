export {
  createChatSocket,
  MockChatSocket,
  normalizeIncomingMessage,
} from "./chatSocket";

export type {
  AdminReplyPayload,
  ChatRoomPayload,
  ChatSocketAdapter,
  ChatSocketAuthentication,
  ChatSocketConfiguration,
  ChatSocketError,
  ChatSocketEventMap,
  ChatSocketEventName,
  ChatSocketListener,
  ChatSocketTransportKind,
  MockChatSocketInspection,
} from "./chatSocket.types";

export {
  CHAT_CONVERSATIONS_ENDPOINT_PENDING,
  CHAT_HISTORY_ENDPOINT,
  CHAT_MARK_READ_ENDPOINT_PENDING,
  getAdminConversations,
  getConversationHistory,
  isChatApiMockMode,
  markConversationRead,
} from "./chatApi";
export type {
  ChatApiOptions,
  ChatHistoryPagination,
  ChatHistoryResult,
} from "./chatApi";

export {
  mergeChatHistory,
  normalizeChatHistory,
} from "./chatNormalization";
export type {
  NormalizationIssue,
  NormalizedChatHistory,
  RawChatHistoryRow,
} from "./chatNormalization";
