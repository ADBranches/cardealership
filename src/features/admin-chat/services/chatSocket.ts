import type { ChatAcknowledgement, ChatMessage, ChatTypingEvent } from "../types";
import type { AdminReplyPayload, ChatRoomPayload, ChatSocketAdapter, ChatSocketConfiguration, ChatSocketEventMap, ChatSocketEventName, ChatSocketListener, MockChatSocketInspection } from "./chatSocket.types";

export function normalizeIncomingMessage(payload: ChatMessage): ChatMessage {
  return {
    id: String(payload.id),
    inquiryId: String(payload.inquiryId),
    senderId: String(payload.senderId),
    senderRole: payload.senderRole,
    message: String(payload.message),
    createdAt: String(payload.createdAt),
    deliveryStatus: payload.deliveryStatus,
    clientMessageId: payload.clientMessageId,
  };
}

export class MockChatSocket implements ChatSocketAdapter {
  readonly gatewayUrl: string;
  readonly transport = "mock" as const;
  readonly mockMode = true;
  private readonly accessTokenPresent: boolean;
  private readonly reconnectDelayMilliseconds: number;
  private readonly listeners = new Map<ChatSocketEventName, Set<(payload: unknown) => void>>();
  private readonly joinedRooms = new Set<string>();
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();
  private connected = false;
  private destroyed = false;
  private readonly inspection: MockChatSocketInspection = {
    connectCount: 0,
    disconnectCount: 0,
    joinedRooms: [],
    leftRooms: [],
    sentReplies: [],
    sentTypingEvents: [],
    authenticationAttached: false,
    authenticationTokenExposed: false,
  };

  constructor(configuration: ChatSocketConfiguration) {
    this.gatewayUrl = configuration.gatewayUrl;
    this.accessTokenPresent = configuration.authentication.accessToken.trim().length > 0;
    this.reconnectDelayMilliseconds = configuration.reconnectDelayMilliseconds ?? 250;
    this.inspection.authenticationAttached = this.accessTokenPresent;
  }

  connect(): void {
    if (this.connected || this.destroyed) return;
    this.connected = true;
    this.inspection.connectCount += 1;
    this.emit("connection", "connecting");
    this.schedule(() => {
      if (!this.connected || this.destroyed) return;
      this.emit("connection", "connected");
    }, 0);
  }

  disconnect(): void {
    if (this.destroyed) return;
    this.connected = false;
    this.destroyed = true;
    this.inspection.disconnectCount += 1;
    for (const timer of this.timers) clearTimeout(timer);
    this.timers.clear();
    this.joinedRooms.clear();
    this.emit("connection", "disconnected");
    this.listeners.clear();
  }

  joinRoom(payload: ChatRoomPayload): void {
    if (!payload.inquiryId.trim() || this.joinedRooms.has(payload.inquiryId)) return;
    this.joinedRooms.add(payload.inquiryId);
    this.inspection.joinedRooms.push(payload.inquiryId);
  }

  leaveRoom(payload: ChatRoomPayload): void {
    if (!this.joinedRooms.delete(payload.inquiryId)) return;
    this.inspection.leftRooms.push(payload.inquiryId);
  }

  sendReply(payload: AdminReplyPayload): void {
    if (!this.joinedRooms.has(payload.inquiryId)) {
      this.emit("error", { code: "INVALID_PAYLOAD", message: "A reply cannot be sent outside the active inquiry room." });
      return;
    }
    this.inspection.sentReplies.push({ ...payload });
    const acknowledgement: ChatAcknowledgement = {
      inquiryId: payload.inquiryId,
      clientMessageId: payload.clientMessageId,
      messageId: `mock-confirmed-${payload.clientMessageId}`,
      acknowledgedAt: payload.sentAt,
    };
    this.schedule(() => this.emit("acknowledgement", acknowledgement), 0);
  }

  sendTyping(payload: ChatTypingEvent): void {
    if (!this.joinedRooms.has(payload.inquiryId)) return;
    this.inspection.sentTypingEvents.push({ ...payload });
  }

  on<K extends ChatSocketEventName>(eventName: K, listener: ChatSocketListener<K>): () => void {
    const listeners = this.listeners.get(eventName) ?? new Set<(payload: unknown) => void>();
    listeners.add(listener as (payload: unknown) => void);
    this.listeners.set(eventName, listeners);
    return () => {
      listeners.delete(listener as (payload: unknown) => void);
      if (listeners.size === 0) this.listeners.delete(eventName);
    };
  }

  getListenerCount(eventName?: ChatSocketEventName): number {
    if (eventName) return this.listeners.get(eventName)?.size ?? 0;
    let count = 0;
    for (const listeners of this.listeners.values()) count += listeners.size;
    return count;
  }

  getJoinedRooms(): string[] {
    return [...this.joinedRooms].sort();
  }

  getInspection(): MockChatSocketInspection {
    return {
      ...this.inspection,
      joinedRooms: [...this.inspection.joinedRooms],
      leftRooms: [...this.inspection.leftRooms],
      sentReplies: this.inspection.sentReplies.map((payload) => ({ ...payload })),
      sentTypingEvents: this.inspection.sentTypingEvents.map((event) => ({ ...event })),
    };
  }

  simulateIncomingMessage(payload: ChatMessage): void {
    this.emit("message", normalizeIncomingMessage(payload));
  }

  simulateTyping(payload: ChatTypingEvent): void {
    this.emit("typing", { ...payload });
  }

  simulateReconnect(): void {
    if (this.destroyed) return;
    this.connected = false;
    this.emit("connection", "reconnecting");
    this.schedule(() => {
      if (this.destroyed) return;
      this.connected = true;
      this.emit("connection", "connected");
    }, this.reconnectDelayMilliseconds);
  }

  private emit<K extends ChatSocketEventName>(eventName: K, payload: ChatSocketEventMap[K]): void {
    const listeners = this.listeners.get(eventName);
    if (!listeners) return;
    for (const listener of [...listeners]) listener(payload);
  }

  private schedule(callback: () => void, delay: number): void {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      callback();
    }, Math.max(0, delay));
    this.timers.add(timer);
  }
}

export function createChatSocket(configuration: ChatSocketConfiguration): ChatSocketAdapter {
  if (configuration.transport !== "mock" || !configuration.mockMode) {
    throw new Error("Live chat transport is unavailable until Devine confirms the protocol.");
  }
  return new MockChatSocket(configuration);
}
