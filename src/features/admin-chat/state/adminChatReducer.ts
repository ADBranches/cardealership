import type {
  AdminChatState,
  ChatAcknowledgement,
  ChatConnectionStatus,
  ChatConversationSummary,
  ChatError,
  ChatMessage,
  ChatTypingEvent,
} from "../types";
import { deduplicateMessages, orderConversations } from "./messageOrdering";
import { mergeChatHistory } from "../services/chatNormalization";
import {
  createUnreadConversationState,
  markConversationRead,
  nextUnreadCount,
  shouldIncrementUnreadCount,
} from "./unreadRules";

export type AdminChatAction =
  | { type: "conversations/hydrate"; conversations: ChatConversationSummary[] }
  | { type: "conversation/upsert"; conversation: ChatConversationSummary }
  | { type: "history/merge"; inquiryId: string; messages: ChatMessage[] }
  | { type: "conversation/select"; inquiryId: string; readAt: string }
  | { type: "message/receive"; message: ChatMessage }
  | { type: "message/acknowledge"; acknowledgement: ChatAcknowledgement }
  | { type: "typing/set"; event: ChatTypingEvent }
  | { type: "typing/expire"; now: string; maxAgeMilliseconds: number }
  | { type: "connection/set"; status: ChatConnectionStatus }
  | { type: "loading/conversations"; loading: boolean }
  | { type: "loading/history"; loading: boolean }
  | { type: "error/set"; error: ChatError }
  | { type: "error/clear" };

function upsertConversation(
  conversations: readonly ChatConversationSummary[],
  conversation: ChatConversationSummary,
): ChatConversationSummary[] {
  const existingIndex = conversations.findIndex(
    (item) => item.inquiry.id === conversation.inquiry.id,
  );

  const nextConversations = [...conversations];
  if (existingIndex === -1) nextConversations.push(conversation);
  else nextConversations[existingIndex] = conversation;

  return orderConversations(nextConversations);
}

function updateConversationForMessage(
  state: AdminChatState,
  message: ChatMessage,
): AdminChatState {
  const existingConversation = state.conversations.find(
    (conversation) => conversation.inquiry.id === message.inquiryId,
  );

  if (!existingConversation) return state;

  const currentMessages = state.messagesByInquiry[message.inquiryId] ?? [];
  const duplicate = currentMessages.some((item) => item.id === message.id);
  if (duplicate) return state;

  const messages = deduplicateMessages([...currentMessages, message]);
  const incrementUnread = shouldIncrementUnreadCount(
    state.activeInquiryId,
    message,
  );
  const unreadCount = nextUnreadCount(
    existingConversation.unreadCount,
    incrementUnread,
  );
  const conversation = {
    ...existingConversation,
    inquiry: {
      ...existingConversation.inquiry,
      updatedAt: message.createdAt,
    },
    latestMessage: messages[messages.length - 1] ?? message,
    unreadCount,
  };

  return {
    ...state,
    conversations: upsertConversation(state.conversations, conversation),
    messagesByInquiry: {
      ...state.messagesByInquiry,
      [message.inquiryId]: messages,
    },
    unreadByInquiry: {
      ...state.unreadByInquiry,
      [message.inquiryId]: createUnreadConversationState(
        message.inquiryId,
        unreadCount,
        existingConversation.lastReadAt ?? null,
      ),
    },
  };
}

function acknowledgeMessage(
  state: AdminChatState,
  acknowledgement: ChatAcknowledgement,
): AdminChatState {
  const currentMessages = state.messagesByInquiry[acknowledgement.inquiryId];
  if (!currentMessages) return state;

  let matched = false;
  const messages = currentMessages.map((message) => {
    const clientMatches =
      acknowledgement.clientMessageId !== undefined &&
      message.clientMessageId === acknowledgement.clientMessageId;
    const idMatches = message.id === acknowledgement.messageId;

    if (!clientMatches && !idMatches) return message;
    matched = true;
    return {
      ...message,
      id: acknowledgement.messageId,
      deliveryStatus: "sent" as const,
    };
  });

  if (!matched) return state;

  return {
    ...state,
    messagesByInquiry: {
      ...state.messagesByInquiry,
      [acknowledgement.inquiryId]: deduplicateMessages(messages),
    },
  };
}

function setTypingEvent(
  state: AdminChatState,
  event: ChatTypingEvent,
): AdminChatState {
  if (!state.conversations.some((item) => item.inquiry.id === event.inquiryId)) {
    return state;
  }

  const currentEvents = state.typingByInquiry[event.inquiryId] ?? [];
  const withoutUser = currentEvents.filter((item) => item.userId !== event.userId);
  const nextEvents = event.isTyping ? [...withoutUser, event] : withoutUser;

  return {
    ...state,
    typingByInquiry: {
      ...state.typingByInquiry,
      [event.inquiryId]: nextEvents,
    },
  };
}

function expireTypingEvents(
  state: AdminChatState,
  now: string,
  maxAgeMilliseconds: number,
): AdminChatState {
  const nowValue = Date.parse(now);
  if (!Number.isFinite(nowValue)) return state;

  const safeMaxAge = Math.max(0, maxAgeMilliseconds);
  const typingByInquiry: AdminChatState["typingByInquiry"] = {};

  for (const [inquiryId, events] of Object.entries(state.typingByInquiry)) {
    typingByInquiry[inquiryId] = events.filter((event) => {
      const occurredAt = Date.parse(event.occurredAt);
      return Number.isFinite(occurredAt) && nowValue - occurredAt <= safeMaxAge;
    });
  }

  return { ...state, typingByInquiry };
}

export function adminChatReducer(
  state: AdminChatState,
  action: AdminChatAction,
): AdminChatState {
  switch (action.type) {
    case "conversations/hydrate": {
      const conversations = orderConversations(action.conversations);
      const activeInquiryId = state.activeInquiryId && conversations.some(
        (conversation) => conversation.inquiry.id === state.activeInquiryId,
      )
        ? state.activeInquiryId
        : conversations[0]?.inquiry.id ?? null;

      return {
        ...state,
        conversations,
        activeInquiryId,
        unreadByInquiry: Object.fromEntries(
          conversations.map((conversation) => [
            conversation.inquiry.id,
            createUnreadConversationState(
              conversation.inquiry.id,
              conversation.unreadCount,
              conversation.lastReadAt ?? null,
            ),
          ]),
        ),
      };
    }
    case "history/merge":
      return {
        ...state,
        messagesByInquiry: {
          ...state.messagesByInquiry,
          [action.inquiryId]: mergeChatHistory(
            action.messages,
            state.messagesByInquiry[action.inquiryId] ?? [],
          ),
        },
      };
    case "conversation/upsert":
      return {
        ...state,
        conversations: upsertConversation(
          state.conversations,
          action.conversation,
        ),
      };

    case "conversation/select": {
      const conversationExists = state.conversations.some(
        (conversation) => conversation.inquiry.id === action.inquiryId,
      );
      if (!conversationExists) return state;

      return markConversationRead(
        { ...state, activeInquiryId: action.inquiryId },
        action.inquiryId,
        action.readAt,
      );
    }

    case "message/receive":
      return updateConversationForMessage(state, action.message);

    case "message/acknowledge":
      return acknowledgeMessage(state, action.acknowledgement);

    case "typing/set":
      return setTypingEvent(state, action.event);

    case "typing/expire":
      return expireTypingEvents(
        state,
        action.now,
        action.maxAgeMilliseconds,
      );

    case "connection/set":
      return { ...state, connectionStatus: action.status };

    case "loading/conversations":
      return { ...state, isLoadingConversations: action.loading };

    case "loading/history":
      return { ...state, isLoadingHistory: action.loading };

    case "error/set":
      return { ...state, error: action.error };

    case "error/clear":
      return { ...state, error: null };
  }
}
