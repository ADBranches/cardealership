import { useCallback, useEffect, useRef } from "react";
import { getChatEnvironment } from "../../../config/env";
import {
  createChatSocket,
  type AdminReplyPayload,
  type ChatSocketAdapter,
} from "../services";
import type {
  ChatAcknowledgement,
  ChatConnectionStatus,
  ChatError,
  ChatMessage,
  ChatTypingEvent,
} from "../types";

type UseChatSocketOptions = {
  accessToken: string | null;
  activeInquiryId: string | null;
  onConnectionStatus: (status: ChatConnectionStatus) => void;
  onMessage: (message: ChatMessage) => void;
  onTyping: (event: ChatTypingEvent) => void;
  onAcknowledgement: (acknowledgement: ChatAcknowledgement) => void;
  onError: (error: ChatError) => void;
};

export function useChatSocket(options: UseChatSocketOptions) {
  const adapterRef = useRef<ChatSocketAdapter | null>(null);
  const previousRoomRef = useRef<string | null>(null);

  useEffect(() => {
    const environment = getChatEnvironment();
    const adapter = createChatSocket({
      gatewayUrl: environment.gatewayUrl,
      transport: environment.transport,
      mockMode: environment.mockMode,
      authentication: {
        accessToken: options.accessToken ?? "",
      },
    });

    adapterRef.current = adapter;

    const unsubscribes = [
      adapter.on("connection", options.onConnectionStatus),
      adapter.on("message", options.onMessage),
      adapter.on("typing", options.onTyping),
      adapter.on("acknowledgement", options.onAcknowledgement),
      adapter.on("error", (socketError) => {
        options.onError({ code: "CONNECTION_FAILED", message: socketError.message });
      }),
    ];

    adapter.connect();

    return () => {
      previousRoomRef.current = null;
      for (const unsubscribe of unsubscribes) unsubscribe();
      adapter.disconnect();
      adapterRef.current = null;
    };
  }, [
    options.accessToken,
    options.onAcknowledgement,
    options.onConnectionStatus,
    options.onError,
    options.onMessage,
    options.onTyping,
  ]);

  useEffect(() => {
    const adapter = adapterRef.current;
    if (!adapter) return;

    const previousRoom = previousRoomRef.current;
    if (previousRoom && previousRoom !== options.activeInquiryId) {
      adapter.leaveRoom({ inquiryId: previousRoom });
    }

    if (options.activeInquiryId) {
      adapter.joinRoom({ inquiryId: options.activeInquiryId });
    }

    previousRoomRef.current = options.activeInquiryId;
  }, [options.activeInquiryId]);

  const sendReply = useCallback((payload: AdminReplyPayload) => {
    adapterRef.current?.sendReply(payload);
  }, []);

  const sendTyping = useCallback((event: ChatTypingEvent) => {
    adapterRef.current?.sendTyping(event);
  }, []);

  return { sendReply, sendTyping };
}
