export type ChatSenderRole = "customer" | "admin" | "system";

export type ChatConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error";

export type ChatMessageDeliveryStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "failed";

export interface ChatUser {
  id: string;
  name: string;
  email?: string;
  role: ChatSenderRole;
}

export interface ChatParticipant {
  user: ChatUser;
  joinedAt?: string;
  isOnline?: boolean;
}

export interface ChatVehicleReference {
  id: string;
  label?: string;
  primaryImageUrl?: string;
}

export interface ChatInquiry {
  id: string;
  customer: ChatUser;
  vehicle?: ChatVehicleReference;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  inquiryId: string;
  senderId: string;
  senderRole: ChatSenderRole;
  message: string;
  createdAt: string;
  deliveryStatus?: ChatMessageDeliveryStatus;
  clientMessageId?: string;
}

export interface ChatConversationSummary {
  inquiry: ChatInquiry;
  latestMessage: ChatMessage | null;
  unreadCount: number;
  lastReadAt?: string | null;
}

export interface ChatTypingEvent {
  inquiryId: string;
  userId: string;
  role: ChatSenderRole;
  isTyping: boolean;
  occurredAt: string;
}

export interface ChatMessageEvent {
  inquiryId: string;
  message: ChatMessage;
}

export interface ChatAcknowledgement {
  inquiryId: string;
  clientMessageId?: string;
  messageId: string;
  acknowledgedAt: string;
}

export type ChatErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INVALID_PAYLOAD"
  | "CONNECTION_FAILED"
  | "HISTORY_LOAD_FAILED"
  | "MESSAGE_SEND_FAILED"
  | "UNKNOWN_CHAT_ERROR";

export interface ChatError {
  code: ChatErrorCode;
  message: string;
  inquiryId?: string;
  clientMessageId?: string;
}
export interface UnreadConversationState {
  inquiryId: string;
  unreadCount: number;
  lastReadAt?: string | null;
}

export interface AdminChatState {
  conversations: ChatConversationSummary[];
  activeInquiryId: string | null;
  messagesByInquiry: Record<string, ChatMessage[]>;
  typingByInquiry: Record<string, ChatTypingEvent[]>;
  unreadByInquiry: Record<string, UnreadConversationState>;
  connectionStatus: ChatConnectionStatus;
  isLoadingConversations: boolean;
  isLoadingHistory: boolean;
  error: ChatError | null;
}
