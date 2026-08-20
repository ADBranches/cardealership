import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import {
  adminChatConversations,
  adminChatMessagesByInquiry,
  adminChatTypingFixture,
} from "../data/adminChatFixtures";
import {
  adminChatReducer,
  getActiveConversation,
  getTotalUnreadCount,
  orderConversations,
  orderMessages,
} from "../state";
import type {
  AdminChatState,
  ChatConnectionStatus,
  ChatConversationSummary,
  ChatError,
  ChatMessage,
  ChatTypingEvent,
} from "../types";

export type SendAdminChatMessageInput = {
  message: string;
  inquiryId?: string;
};

export type AdminChatContextValue = {
  conversations: ChatConversationSummary[];
  activeInquiryId: string | null;
  activeConversation: ChatConversationSummary | null;
  messagesByInquiry: Record<string, ChatMessage[]>;
  connectionStatus: ChatConnectionStatus;
  typingByInquiry: Record<string, ChatTypingEvent[]>;
  totalUnreadCount: number;
  isLoadingConversations: boolean;
  isLoadingHistory: boolean;
  error: ChatError | null;
  selectConversation: (inquiryId: string) => void;
  receiveMessage: (message: ChatMessage) => void;
  sendMessage: (input: SendAdminChatMessageInput) => void;
  markConversationRead: (inquiryId: string) => void;
  setTyping: (event: ChatTypingEvent) => void;
  setConnectionStatus: (status: ChatConnectionStatus) => void;
  loadConversations: () => void;
  loadHistory: (inquiryId: string) => void;
  retry: () => void;
};

export const AdminChatContext = createContext<AdminChatContextValue | null>(null);

function createFixtureState(): AdminChatState {
  const conversations = orderConversations(adminChatConversations);
  const activeInquiryId = conversations[0]?.inquiry.id ?? null;
  const messagesByInquiry = Object.fromEntries(
    Object.entries(adminChatMessagesByInquiry).map(([inquiryId, messages]) => [
      inquiryId,
      orderMessages(messages),
    ]),
  );

  return {
    conversations,
    activeInquiryId,
    messagesByInquiry,
    typingByInquiry: {
      [adminChatTypingFixture.inquiryId]: [adminChatTypingFixture],
    },
    unreadByInquiry: Object.fromEntries(
      conversations.map((conversation) => [
        conversation.inquiry.id,
        {
          inquiryId: conversation.inquiry.id,
          unreadCount: conversation.unreadCount,
          lastReadAt: conversation.lastReadAt ?? null,
        },
      ]),
    ),
    connectionStatus: "idle",
    isLoadingConversations: false,
    isLoadingHistory: false,
    error: null,
  };
}

export function AdminChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    adminChatReducer,
    undefined,
    createFixtureState,
  );
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const optimisticSequenceRef = useRef(0);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timer = setTimeout(() => {
      timersRef.current.delete(timer);
      callback();
    }, delay);
    timersRef.current.add(timer);
  }, []);

  useEffect(() => {
    return () => {
      for (const timer of timersRef.current) clearTimeout(timer);
      timersRef.current.clear();
    };
  }, []);

  const selectConversation = useCallback((inquiryId: string) => {
    dispatch({
      type: "conversation/select",
      inquiryId,
      readAt: new Date().toISOString(),
    });
  }, []);

  const receiveMessage = useCallback((message: ChatMessage) => {
    dispatch({ type: "message/receive", message });
  }, []);

  const sendMessage = useCallback(
    (input: SendAdminChatMessageInput) => {
      const inquiryId = input.inquiryId ?? state.activeInquiryId;
      const messageText = input.message.trim();
      if (!inquiryId || !messageText) return;

      optimisticSequenceRef.current += 1;
      const clientMessageId = `admin-local-${optimisticSequenceRef.current}`;
      const message: ChatMessage = {
        id: clientMessageId,
        inquiryId,
        senderId: "admin-local",
        senderRole: "admin",
        message: messageText,
        createdAt: new Date().toISOString(),
        deliveryStatus: "pending",
        clientMessageId,
      };

      dispatch({ type: "message/receive", message });
    },
    [state.activeInquiryId],
  );

  const markConversationRead = useCallback((inquiryId: string) => {
    dispatch({
      type: "conversation/select",
      inquiryId,
      readAt: new Date().toISOString(),
    });
  }, []);

  const setTyping = useCallback(
    (event: ChatTypingEvent) => {
      dispatch({ type: "typing/set", event });
      if (!event.isTyping) return;

      schedule(() => {
        dispatch({
          type: "typing/expire",
          now: new Date().toISOString(),
          maxAgeMilliseconds: 5000,
        });
      }, 5000);
    },
    [schedule],
  );

  const setConnectionStatus = useCallback((status: ChatConnectionStatus) => {
    dispatch({ type: "connection/set", status });
  }, []);


  const loadConversations = useCallback(() => {
    dispatch({ type: "error/clear" });
    dispatch({ type: "loading/conversations", loading: true });
    schedule(() => {
      dispatch({ type: "loading/conversations", loading: false });
    }, 150);
  }, [schedule]);

  const loadHistory = useCallback(
    (inquiryId: string) => {
      if (!state.conversations.some((item) => item.inquiry.id === inquiryId)) {
        dispatch({
          type: "error/set",
          error: {
            code: "HISTORY_LOAD_FAILED",
            message: "The selected conversation could not be loaded.",
            inquiryId,
          },
        });
        return;
      }

      dispatch({ type: "error/clear" });
      dispatch({ type: "loading/history", loading: true });
      schedule(() => {
        dispatch({ type: "loading/history", loading: false });
      }, 150);
    },
    [schedule, state.conversations],
  );

  const retry = useCallback(() => {
    dispatch({ type: "error/clear" });
    if (state.activeInquiryId) loadHistory(state.activeInquiryId);
    else loadConversations();
  }, [loadConversations, loadHistory, state.activeInquiryId]);

  const activeConversation = useMemo(
    () => getActiveConversation(state),
    [state],
  );

  const totalUnreadCount = useMemo(
    () => getTotalUnreadCount(state.conversations),
    [state.conversations],
  );

  const value = useMemo<AdminChatContextValue>(
    () => ({
      conversations: state.conversations,
      activeInquiryId: state.activeInquiryId,
      activeConversation,
      messagesByInquiry: state.messagesByInquiry,
      connectionStatus: state.connectionStatus,
      typingByInquiry: state.typingByInquiry,
      totalUnreadCount,
      isLoadingConversations: state.isLoadingConversations,
      isLoadingHistory: state.isLoadingHistory,
      error: state.error,
      selectConversation,
      receiveMessage,
      sendMessage,
      markConversationRead,
      setTyping,
      setConnectionStatus,
      loadConversations,
      loadHistory,
      retry,
    }),
    [
      state,
      activeConversation,
      totalUnreadCount,
      selectConversation,
      receiveMessage,
      sendMessage,
      markConversationRead,
      setTyping,
      setConnectionStatus,
      loadConversations,
      loadHistory,
      retry,
    ],
  );

  return (
    <AdminChatContext.Provider value={value}>
      {children}
    </AdminChatContext.Provider>
  );
}
