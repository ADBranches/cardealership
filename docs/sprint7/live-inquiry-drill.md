# Sprint 7 Cross-Team Live Inquiry Drill

## Current status

BLOCKED. The live end-to-end drill has not been represented as passed because the required customer-widget, gateway, transcript-persistence, and history implementations are not yet available together in a confirmed shared environment.

Reminder emails have already been sent to the responsible collaborators. The frontend currently retains explicitly identified adapters and synthetic fixtures until compatible implementations are published and inspected.

## Drill record

- Record created: 2026-08-22T09:45:36+03:00
- Edwin frontend branch: feature/edwin-sprint7-admin-chat
- Edwin frontend commit: 80023f4f61af58b04fd89788b56fcec992ef86b8
- Edward inspected branch commit: 92e3fa88b6a8277f3c08812e5da9d6f06a809d64
- Devine inspected branch commit: bafc6009d1409a39b4c83478c7515a72c2497d99
- Ronald inspected branch commit: e570b160941c9fe203b4b2921fc972f12dfa6d24
- Environment: Not yet confirmed.
- Inquiry ID: Not created.
- Final status: Blocked by cross-team integration dependencies.

## Participants required

- Edward: customer vehicle page and inquiry widget.
- Devine: authenticated gateway, inquiry-room routing, typing, acknowledgement, error, and reconnection events.
- Edwin: protected admin inbox, navigation badge, reply workflow, and frontend evidence.
- Ronald: transcript persistence and history restoration.

## Required walkthrough

- [ ] Edward opens a specific vehicle page.
- [ ] Edward creates or joins an inquiry through the customer widget.
- [ ] Edward sends a uniquely identifiable test message.
- [ ] Devine confirms that the gateway receives and routes the payload to the correct inquiry room.
- [ ] Edwin confirms that the admin navigation badge increments immediately.
- [ ] Edwin opens the protected admin inbox.
- [ ] Edwin confirms that the correct customer, vehicle, and message appear.
- [ ] Edwin sends an admin reply.
- [ ] Edward confirms that the reply arrives in real time.
- [ ] Approved customer-to-admin typing behavior is tested.
- [ ] Approved admin-to-customer typing behavior is tested.
- [ ] Ronald confirms transcript persistence.
- [ ] The conversation is closed and reopened.
- [ ] Ronald confirms that the history endpoint restores prior messages.
- [ ] Duplicate-message handling and unread counts are verified.
- [ ] Gateway reconnection behavior is tested.

## Evidence to record during execution

- Exact date and time.
- Participating team members.
- Frontend, widget, gateway, and persistence commit hashes.
- Shared environment name and public origins, without credentials.
- Inquiry ID.
- Sanitized event sequence.
- HTTP route names and status codes.
- Socket event names and delivery results.
- Unread-count transitions.
- Persistence confirmation.
- Reopen and history-restoration result.
- Defects, owners, and follow-up dates.
- Final PASS or BLOCKED status.

## Security and privacy rules

- Do not record access tokens, cookies, authorization headers, passwords, private URLs, or secret values.
- Do not commit customer message contents or full transcripts.
- Use a unique non-sensitive test marker only during the live drill.
- Redact identifiers from screenshots unless the identifier is an approved synthetic inquiry ID.
- Record status codes and event names instead of private payload contents.

## Current blockers

- Edward customer-widget contract and live implementation require confirmation.
- Devine gateway URL, transport, room routing, typing, acknowledgement, failure, and reconnect contracts require confirmation.
- Ronald implementation is available but requires deployment and live validation in the shared environment.
- One shared environment with compatible commits has not been confirmed.

## Exit criteria

- [ ] Bidirectional end-to-end message delivery passes.
- [ ] The admin navigation badge updates correctly.
- [ ] The transcript is persisted and restored.
- [ ] Duplicate delivery and unread behavior are correct.
- [ ] Reconnection behavior passes.
- [ ] Defects have owners and follow-up dates.
- [x] No private token or transcript content is recorded in this document.

## Follow-up rule

When the collaborator implementations are pushed, inspect all affected branches and contracts in one consolidated dependency review. Replace frontend mocks only after confirming the complete customer-widget, gateway, persistence, and history structures.

## Latest readiness decision

- Reinspected at: 2026-08-31T15:45:00+03:00.
- Reserved test marker: `SPRINT7-20260831T132250Z`.
- The marker was not transmitted because the live drill did not start.
- Edwin frontend commit: `36923df7a7964ddfb0a95f7a9338055d8ff23c44`.
- Edward branch commit: `92e3fa88b6a8277f3c08812e5da9d6f06a809d64`.
- Devine branch commit: `bafc6009d1409a39b4c83478c7515a72c2497d99`.
- Ronald branch commit: `49c0e09db85761b4e57a0f072c5250722d21800c`.
- Environment: not provided.
- Inquiry ID: not created.
- HTTP results: not executed against a shared environment.
- Socket results: not executed because no live gateway contract exists.
- Unread-count result: not tested live.
- Persistence result: implementation inspected, live storage not tested.
- Reopen and history result: implementation inspected, live restoration not tested.
- Final status: BLOCKED.

### Readiness graph

- Edward customer widget: BLOCKED. No inquiry creation, joining, messaging, reply-receipt, typing, or socket implementation was found.
- Devine gateway: BLOCKED. No live chat gateway, handshake contract, room routing, bidirectional delivery, typing, acknowledgement, or reconnect implementation was found.
- Edwin admin inbox: FRONTEND VALIDATED, LIVE INTEGRATION BLOCKED. The adapter intentionally rejects unconfirmed live transport.
- Ronald persistence: IMPLEMENTATION READY FOR SHARED-ENVIRONMENT VALIDATION. Protected message storage, ownership-aware history access, admin-only conversation listing, admin-only mark-as-read, pagination, duplicate reconciliation, unread aggregation, and retention metadata are present.
- Shared environment: BLOCKED. Compatible deployed origins and credentials were not supplied.
- Live walkthrough: NOT STARTED.

### Outstanding owners and follow-up dates

- Edward: publish the customer widget and inquiry contract by 2026-09-04.
- Devine: publish the authenticated gateway and event contract by 2026-09-04.
- Edwin: integrate the confirmed live gateway contract after Devine publishes it; target reinspection date 2026-09-05.
- Ronald: deploy commit `49c0e09` in the shared environment and provide sanitized endpoint-validation evidence by 2026-09-04.
- Project integration owner: publish the shared environment details and schedule all participants by 2026-09-04.
- Cross-team drill retry target: 2026-09-05, subject to all dependencies being available.

### Ronald implementation evidence

- `POST /api/chat/messages` requires authentication and enforces the authenticated sender identity.
- Customer writes cannot impersonate another customer.
- Duplicate messages are reconciled by conversation ID and client message ID.
- `GET /api/chat/conversations/:conversationId/messages` requires authentication and checks admin or customer ownership.
- `GET /api/admin/chat/conversations` requires authentication and administrator authorization.
- `PATCH /api/admin/chat/conversations/:conversationId/read` requires authentication and administrator authorization.
- History and conversation listing provide bounded pagination.
- Customer unread totals are derived from persisted unread messages.
- Transcript records carry retention-expiry metadata based on the configured retention period.
- Live database behavior remains unverified until deployment in the shared environment.

## Dependency reinspection

- Reinspected at: 2026-08-22T09:51:56+03:00
- Edward branch remained at 92e3fa88b6a8277f3c08812e5da9d6f06a809d64.
- No Edward customer chat widget, inquiry creation, joining, messaging, typing, or socket contract was found.
- Devine branch remained at bafc6009d1409a39b4c83478c7515a72c2497d99.
- No Devine chat gateway files, WebSocket dependency, room routing, typing, acknowledgement, or reconnection contract was found.
- Ronald branch remained at e570b160941c9fe203b4b2921fc972f12dfa6d24.
- Ronald provides POST /api/chat/messages and GET /api/chat/conversations/:conversationId/messages.
- Ronald also has authentication middleware elsewhere in the backend, but the inspected chat routes did not show confirmed authentication or administrator authorization.
- No compatible shared environment or inquiry identifier is available.
- Decision: retain the frontend adapters and synthetic fixtures. Do not replace them until all contracts are published and inspected together.
- Cross-team live inquiry walkthrough remains BLOCKED.
