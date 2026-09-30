# Sprint 7 Chat Security Review

## Scope

This review covers the Sprint 7 admin chat route, provider, transcript API, socket adapter, message rendering, error handling, browser persistence, and logout teardown.

## Frontend controls verified

- `/Admin/chat` is nested under authentication and an explicit admin-role boundary.
- `AdminChatProvider` mounts only inside the authorized admin layout.
- Context operations require both the admin role and a non-empty access token.
- Transcript listing, history, and mark-as-read operations reject empty tokens, including mock mode.
- Socket creation rejects empty tokens, and direct mock connection remains disconnected without authentication.
- Production builds disable API mock selection and reject mock socket transport.
- Incoming messages use an allowlist. Malformed required fields and invalid roles are rejected; unexpected fields are ignored.
- React renders message content through JSX text interpolation, not executable markup.
- Chat code does not log message bodies, tokens, authorization headers, or raw payloads.
- User-facing errors are generic and omit backend details.
- Chat transcripts are not persisted to unrestricted browser storage.
- Provider teardown disconnects the socket on logout or unmount.
- External and protocol-relative redirects remain blocked.

## Token mechanism

HTTP transcript requests use the shared authenticated API client and bearer authorization. The provisional socket adapter receives the token through its authentication configuration and does not expose it through inspection data or logs. Devine must confirm the authoritative live handshake field before integration.

## Outstanding backend dependencies

### Devine, socket owner

Devine must confirm JWT verification during the handshake, admin authorization before room joins, token expiry and reconnect behavior, TLS requirements, message and typing-event rate limits, and sanitized server logging.

### Ronald, transcript owner

Ronald must confirm authentication and admin authorization on transcript routes, conversation ownership checks, retention and deletion policy, encryption in transit and protection at rest, rate limits, sanitized audit logging, pagination, and deduplication.

## Current production limitation

The frontend cannot prove backend authorization, retention, encryption at rest, or rate limiting until the authoritative integrations are deployed. Production approval requires an integration-environment drill showing that unauthorized route, API, room, and transcript access is rejected.

## Validation

Run `npm run test:chat-security`, the existing chat regressions, and `npm run build`. Tests use synthetic values only and must never contain real tokens or customer transcripts.
