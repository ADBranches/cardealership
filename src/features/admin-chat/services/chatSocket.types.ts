import type {
  ChatAcknowledgement,
  ChatConnectionStatus,
  ChatMessage,
  ChatTypingEvent,
} from "../types";

export type ChatSocketTransportKind =
  | "mock"
  | "native-websocket"
  | "socket.io";

export type ChatSocketAuthentication = {
  accessToken: string;
};

export type ChatSocketConfiguration = {
  gatewayUrl: string;
  transport: ChatSocketTransportKind;
  mockMode: boolean;
  authentication: ChatSocketAuthentication;
  reconnectDelayMilliseconds?: number;
};

export type ChatRoomPayload = {
  inquiryId: string;
};

export type AdminReplyPayload = {
  inquiryId: string;
  message: string;
  clientMessageId: string;
  sentAt: string;
};

export type ChatSocketError = {
  code:
    | "TRANSPORT_UNCONFIRMED"
    | "CONNECTION_FAILED"
    | "INVALID_PAYLOAD";
  message: string;
  inquiryId?: string;
  clientMessageId?: string;
};

export type ChatSocketEventMap = {
  connection: ChatConnectionStatus;
  message: ChatMessage;
  typing: ChatTypingEvent;
  acknowledgement: ChatAcknowledgement;
  error: ChatSocketError;
};

export type ChatSocketEventName = keyof ChatSocketEventMap;

export type ChatSocketListener<K extends ChatSocketEventName> = (
  payload: ChatSocketEventMap[K],
) => void;

export interface ChatSocketAdapter {
  readonly gatewayUrl: string;
  readonly transport: ChatSocketTransportKind;
  readonly mockMode: boolean;
  connect(): void;
  disconnect(): void;
  joinRoom(payload: ChatRoomPayload): void;
  leaveRoom(payload: ChatRoomPayload): void;
  sendReply(payload: AdminReplyPayload): void;
  sendTyping(payload: ChatTypingEvent): void;
  on<K extends ChatSocketEventName>(
    eventName: K,
    listener: ChatSocketListener<K>,
  ): () => void;
  getListenerCount(eventName?: ChatSocketEventName): number;
  getJoinedRooms(): string[];
}

export type MockChatSocketInspection = {
  connectCount: number;
  disconnectCount: number;
  joinedRooms: string[];
  leftRooms: string[];
  sentReplies: AdminReplyPayload[];
  sentTypingEvents: ChatTypingEvent[];
  authenticationAttached: boolean;
  authenticationTokenExposed: boolean;
};
