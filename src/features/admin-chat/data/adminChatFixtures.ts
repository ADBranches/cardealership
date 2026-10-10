import type { ChatConversationSummary, ChatMessage, ChatTypingEvent } from "../types";

export const ADMIN_CHAT_FIXTURES_ARE_SYNTHETIC = true;

export const adminChatConversations: ChatConversationSummary[] = [
  {
    inquiry: {
      id: "inquiry-001",
      customer: {
        id: "customer-001",
        name: "Amina N.",
        email: "amina.synthetic@example.test",
        role: "customer",
      },
      vehicle: {
        id: "vehicle-001",
        label: "2023 Toyota Land Cruiser",
      },
      createdAt: "2026-08-19T09:15:00.000Z",
      updatedAt: "2026-08-19T10:42:00.000Z",
    },
    latestMessage: {
      id: "message-003",
      inquiryId: "inquiry-001",
      senderId: "customer-001",
      senderRole: "customer",
      message: "Can I arrange a viewing tomorrow morning?",
      createdAt: "2026-08-19T10:42:00.000Z",
      deliveryStatus: "delivered",
    },
    unreadCount: 2,
    lastReadAt: "2026-08-19T09:40:00.000Z",
  },
  {
    inquiry: {
      id: "inquiry-002",
      customer: {
        id: "customer-002",
        name: "Daniel K.",
        email: "daniel.synthetic@example.test",
        role: "customer",
      },
      vehicle: {
        id: "vehicle-002",
        label: "2022 BMW X5",
      },
      createdAt: "2026-08-19T08:10:00.000Z",
      updatedAt: "2026-08-19T10:20:00.000Z",
    },
    latestMessage: {
      id: "message-006",
      inquiryId: "inquiry-002",
      senderId: "admin-001",
      senderRole: "admin",
      message: "The service history is available for review.",
      createdAt: "2026-08-19T10:20:00.000Z",
      deliveryStatus: "sent",
    },
    unreadCount: 0,
    lastReadAt: "2026-08-19T10:20:00.000Z",
  },
  {
    inquiry: {
      id: "inquiry-003",
      customer: {
        id: "customer-003",
        name: "Grace T.",
        role: "customer",
      },
      vehicle: {
        id: "vehicle-003",
        label: "2024 Ford Ranger",
      },
      createdAt: "2026-08-19T07:45:00.000Z",
      updatedAt: "2026-08-19T09:54:00.000Z",
    },
    latestMessage: {
      id: "message-008",
      inquiryId: "inquiry-003",
      senderId: "customer-003",
      senderRole: "customer",
      message: "Does the listed price include registration?",
      createdAt: "2026-08-19T09:54:00.000Z",
      deliveryStatus: "delivered",
    },
    unreadCount: 1,
    lastReadAt: null,
  },
];

export const adminChatMessagesByInquiry: Record<string, ChatMessage[]> = {
  "inquiry-001": [
    {
      id: "message-001",
      inquiryId: "inquiry-001",
      senderId: "customer-001",
      senderRole: "customer",
      message: "Hello, is the Land Cruiser still available?",
      createdAt: "2026-08-19T09:15:00.000Z",
      deliveryStatus: "delivered",
    },
    {
      id: "message-002",
      inquiryId: "inquiry-001",
      senderId: "admin-001",
      senderRole: "admin",
      message: "Yes, the vehicle is available.",
      createdAt: "2026-08-19T09:40:00.000Z",
      deliveryStatus: "sent",
    },
    {
      id: "message-003",
      inquiryId: "inquiry-001",
      senderId: "customer-001",
      senderRole: "customer",
      message: "Can I arrange a viewing tomorrow morning?",
      createdAt: "2026-08-19T10:42:00.000Z",
      deliveryStatus: "delivered",
    },
  ],
  "inquiry-002": [
    {
      id: "message-005",
      inquiryId: "inquiry-002",
      senderId: "customer-002",
      senderRole: "customer",
      message: "Could you share the vehicle service history?",
      createdAt: "2026-08-19T10:12:00.000Z",
      deliveryStatus: "delivered",
    },
    {
      id: "message-006",
      inquiryId: "inquiry-002",
      senderId: "admin-001",
      senderRole: "admin",
      message: "The service history is available for review.",
      createdAt: "2026-08-19T10:20:00.000Z",
      deliveryStatus: "sent",
    },
  ],
  "inquiry-003": [
    {
      id: "message-008",
      inquiryId: "inquiry-003",
      senderId: "customer-003",
      senderRole: "customer",
      message: "Does the listed price include registration?",
      createdAt: "2026-08-19T09:54:00.000Z",
      deliveryStatus: "delivered",
    },
  ],
};

export const adminChatTypingFixture: ChatTypingEvent = {
  inquiryId: "inquiry-001",
  userId: "customer-001",
  role: "customer",
  isTyping: true,
  occurredAt: "2026-08-19T10:43:00.000Z",
};
