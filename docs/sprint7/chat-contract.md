# Sprint 7 Cross-Team Chat Contract

## Status

This document defines the provisional frontend contract for Edwin's Sprint 7 admin chat work. Production socket integration remains blocked until Devine publishes the transport and event contract. Full inbox persistence remains partially blocked until Ronald provides conversation listing and read-state endpoints. Customer integration remains blocked until Edward publishes the widget payload contract.

## Contract Principles

- Production event names, gateway URLs, authentication handshakes, and reconnect behavior must not be guessed.
- Inquiry, message, user, and vehicle identifiers are opaque frontend strings.
- Frontend timestamps use ISO 8601 strings.
- The backend remains authoritative for persisted message IDs and timestamps.
- Messages are rendered as text, not executable markup.
- Tokens, authorization headers, and message contents must not be logged.
- Deterministic mock-driven frontend development is permitted while live dependencies remain unavailable.

## Confirmed Ronald Transcript Contract

Source branch: `upstream/Search-Engine-Feeds-&-Chat-Archiving`

### Save message

```http
POST /api/chat/messages
Content-Type: application/json
```

```json
{
  "conversationId": "customer-1-admin",
  "sender": "customer",
  "message": "Is the Land Cruiser still available?"
}
```

Confirmed behavior:

- `conversationId`, `sender`, and non-empty `message` are required strings.
- Input values are trimmed before storage.
- PostgreSQL generates the persisted ID and timestamp.
- Success returns HTTP 201 and the persisted row as `chatMessage`.

### Fetch history

```http
GET /api/chat/conversations/:conversationId/messages
```

The response contains `success`, `conversationId`, `count`, and `messages`. Message rows contain `id`, `conversation_id`, `sender`, `message`, and `created_at`. History is ordered by `created_at` ascending and then `id` ascending.

### Database shape

```text
Table: chat_messages
id: BIGSERIAL primary key
conversation_id: VARCHAR(120), required
sender: VARCHAR(50), required
message: TEXT, required
created_at: TIMESTAMPTZ, required, defaults to NOW()
Index: idx_chat_messages_conversation on conversation_id and created_at
```

## Ronald-Owned Pending Details

- Admin conversation-list endpoint
- Mark-as-read endpoint
- Unread-state persistence
- History pagination
- Customer and vehicle metadata in conversation summaries
- Authentication and authorization for chat routes
- Sender-value validation beyond a generic string
- Explicit duplicate-message constraint
- Client message identifier support
- Transcript retention policy

## Devine-Owned Pending WebSocket Contract

No WebSocket package, gateway, room implementation, typing event, acknowledgement event, or chat transport was found on the inspected Devine branch.

Devine must confirm:

- Transport and compatible client package version
- Development and production gateway URLs
- Authentication handshake
- Connection and reconnection behavior
- Inquiry room naming and authorization
- Join-room and leave-room events and payloads
- Incoming-message and admin-reply events and payloads
- Typing-start and typing-stop events and payloads
- Message acknowledgement event and payload
- Error event and payload
- Missed-event replay behavior

Production event constants must remain unset until confirmed.

## Edward-Owned Pending Widget Contract

No customer chat widget or confirmed outgoing payload was found on the inspected Edward branch.

Edward must confirm:

- Customer outgoing message payload
- Customer identity fields
- Vehicle context fields
- Inquiry creation behavior and identifier source
- Typing payload
- Message acknowledgement expectations
- Customer reconnect behavior

## Provisional Frontend Domain

The provisional types are defined in:

```text
src/features/admin-chat/types/chat.types.ts
src/features/admin-chat/types/index.ts
```

The domain covers `ChatUser`, `ChatParticipant`, `ChatInquiry`, `ChatConversationSummary`, `ChatMessage`, `ChatSenderRole`, `ChatConnectionStatus`, `ChatTypingEvent`, `ChatMessageEvent`, `ChatAcknowledgement`, `ChatError`, `UnreadConversationState`, and `AdminChatState`.

### Provisional sender roles

```text
customer
admin
system
```

Only `customer` and `admin` are confirmed by Ronald's examples. `system` is reserved for frontend informational events and must not be persisted without backend approval.

## Normalization Boundary

Ronald's backend uses snake_case fields and `conversationId`; the frontend domain uses camelCase and `inquiryId`.

```text
conversationId or conversation_id -> inquiryId
created_at -> createdAt
id -> string id
sender -> senderRole after validation
message -> message
```

This mapping exists only at the frontend service boundary and does not rename Ronald's endpoint or database fields.

## Mock-Driven Development Authorization

Deterministic synthetic fixtures are authorized for conversation summaries, message history, unread counts, typing state, connection transitions, and acknowledgements. Mock data must be isolated, clearly identified as synthetic, and disabled by default in production.

## Live Integration Gate

Live integration remains blocked until:

- Devine publishes the WebSocket transport and event contract.
- Ronald confirms conversation listing, mark-as-read behavior, and route authorization.
- Edward publishes the customer widget payload contract.
- The team agrees on one inquiry identifier across widget, gateway, inbox, and transcript storage.

## Ownership Summary

- Devine owns real-time transport, rooms, events, acknowledgements, and replay behavior.
- Ronald owns transcript persistence, history retrieval, conversation listing, read state, and retention.
- Edward owns the customer-widget payload and inquiry creation.
- Edwin owns frontend domain types, normalization, admin inbox presentation, and unread badge behavior.

## Phase 2 Decision

Production event names and missing endpoints remain unset. The frontend types establish a safe provisional domain without claiming that pending backend or widget contracts already exist.

## Phase 6 Transport Adapter Decision

No production transport protocol has been confirmed by Devine.

Phase 6 therefore implements a transport-neutral adapter and deterministic mock transport only. No Socket.IO client or other WebSocket package is installed.

Public frontend configuration:

- `VITE_CHAT_GATEWAY_URL` identifies the public gateway URL when approved.
- `VITE_CHAT_TRANSPORT` is currently restricted to the mock adapter.
- `VITE_CHAT_MOCK_MODE` enables deterministic frontend transport testing.

The following remain unset until backend confirmation:

- live transport implementation and compatible client version;
- production event names;
- authentication handshake shape;
- inquiry room event names and payloads;
- acknowledgement event and payload;
- reconnect timing and replay policy.

No backend secret may be exposed through a `VITE_` environment variable. Authentication tokens are supplied at runtime by the existing authenticated session and must never be logged or included in returned transport errors.

## Phase 7 Transcript API Integration Status

Upstream inspection on August 20, 2026 confirmed Ronalds `Search-Engine-Feeds-&-Chat-Archiving` branch at commit `e570b16`.

Confirmed live capability:

- `GET /api/chat/conversations/:conversationId/messages`
- PostgreSQL transcript persistence through `chat_messages`
- chronological ordering by `created_at` and `id`

Pending backend dependencies:

- admin conversation-list endpoint;
- mark-as-read endpoint;
- persisted unread state;
- history pagination contract;
- customer and vehicle summary metadata;
- client-message identifier support;
- duplicate-message constraints;
- route authorization contract;
- transcript retention policy.

Conversation listing and read-state operations therefore use an injectable deterministic mock API. The confirmed history endpoint remains available when API mock mode is disabled.

Mock behavior is controlled by `VITE_CHAT_API_MOCK_MODE=true`. No backend route, database table, or persistence behavior was added by the frontend implementation.

## Phase 8 Admin Reply and Typing Workflow

Upstream inspection on August 21, 2026 confirmed that `Devine-codes` at commit `bafc600` does not yet provide the production chat transport contract.

The following provisional frontend rules are isolated until the transport owner confirms the live contract:

- maximum admin reply length is 2,000 characters;
- empty and whitespace-only replies are rejected;
- messages cannot be sent while chat is disconnected;
- no offline queue is claimed or simulated;
- optimistic replies begin in the `pending` state;
- acknowledgements transition matching replies to `sent`;
- failed replies transition to `failed` and expose a sanitized retry action;
- duplicate acknowledgements do not create duplicate messages;
- typing-start events are throttled to one second;
- typing-stop is sent after three seconds of inactivity;
- typing-stop is sent when the composer is cleared, submitted, switched, or unmounted.

Production event names, payloads, queue behavior, acknowledgement failures, reconnect replay, and final message-length limits remain pending from Devine.

The frontend fallback does not expose tokens, transport diagnostics, backend stack details, or raw failure payloads to administrators.
