# Sprint 7 Admin Chat Deployment Handoff

## Deployment status

The protected admin inbox, unread notification badge, deterministic state management, reply workflow, typing behavior, transcript-history adapter, responsive design, accessibility behavior, security controls, and regression validation are ready for administrator review.

Live cross-team integration remains blocked until compatible customer-widget, gateway, conversation-list, read-state, transcript-security, and shared-environment contracts are available.

## Public frontend environment

Required release configuration:

```text
VITE_API_BASE_URL=https://approved-production-api.example.com
VITE_PROFILE_MOCK_MODE=false
VITE_AVAILABILITY_MOCK_MODE=false
VITE_CHAT_GATEWAY_URL=
VITE_CHAT_TRANSPORT=mock
VITE_CHAT_MOCK_MODE=false
VITE_CHAT_API_MOCK_MODE=false
```

The API example must be replaced by the deployment owner-approved HTTPS API origin. Chat mock flags must remain false in release builds. The gateway URL must stay unset until the live transport contract is approved.

## Security requirements

- Restrict `/Admin/chat` to authenticated administrators.
- Require an access token for transcript and transport operations.
- Never place database URLs, JWT secrets, private keys, passwords, email credentials, or storage secrets in frontend environment variables.
- Never log access tokens, authorization headers, message contents, or transcript payloads.
- Keep transcripts out of unrestricted browser storage.
- Preserve strict incoming-message normalization and text-only rendering.
- Disconnect the transport during logout and provider teardown.
- Keep mock chat transport and mock chat API selection disabled in production.

## Approved and pending contracts

Confirmed transcript history route:

```text
GET /api/chat/conversations/:conversationId/messages
```

The following remain pending and must not be guessed:

- Admin conversation-list endpoint.
- Mark-as-read endpoint and persisted unread state.
- History pagination contract.
- Customer-widget inquiry creation and message contract.
- Gateway transport, authentication handshake, room events, typing events, acknowledgements, failures, and reconnect behavior.
- Transcript ownership, administrator authorization, retention, rate limiting, and duplicate reconciliation.

## Release validation

Run:

```bash
npm run test:sprint7
npm run test:sprint7-release
```

The release command runs the complete Sprint 7 frontend validation and production build with every mock mode explicitly disabled.

After building, confirm:

- No source maps were generated.
- No private configuration name or value entered compiled assets.
- No application-owned local API or socket origin entered compiled assets.
- No generated build asset is staged.
- The working tree contains only intended source and documentation changes.

## Administrator integration notes

- One `AdminChatProvider` is mounted around the active application router.
- The protected route is `/Admin/chat`.
- The admin navigation badge caps its visible count at `99+` while retaining the actual accessible count.
- The frontend domain uses `inquiryId`; the confirmed transcript backend uses `conversationId` and snake-case message fields.
- Frontend normalization must remain between backend payloads and the reducer.
- Replace mocks only after inspecting complete compatible upstream implementations.

## Cross-team walkthrough status

The live inquiry walkthrough is blocked. No shared environment or inquiry identifier has been confirmed, and the customer widget and gateway contracts remain unavailable.

## Handoff checklist

- [x] Frontend tests and regression suites pass.
- [x] Production build passes with mock flags disabled.
- [x] Source maps are disabled.
- [x] Private environment files remain ignored.
- [x] One socket adapter and one protected admin-chat route are present.
- [x] Generated assets are not staged.
- [x] Branch was synchronized with its remote before this final review.
- [ ] Customer widget contract is available.
- [ ] Gateway contract is available.
- [ ] Secured transcript and read-state contracts are complete.
- [ ] Live cross-team walkthrough passes.
- [ ] Repository administrator approves the pull request.
