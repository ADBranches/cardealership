# Sprint 8 Dependency Register

## Administrator car-listing wizard

- Existing wizard presentation: PARTIAL. A four-step frontend form exists.
- Draft state preservation: READY FOR REFACTORING. Component state survives backward and forward step navigation.
- Backend car creation: PARTIAL. Protected creation exists, but frontend and backend field names differ.
- Local multi-image selection: READY after approval.
- Live batch upload: BLOCKED. Only single-image upload is confirmed.
- Image ordering: BLOCKED. No ordering contract is confirmed.
- Partial batch recovery: BLOCKED. No batch-failure contract is confirmed.
- Dynamic pricing and deal badge: BLOCKED. No pricing-matrix implementation was found.
- Administrator MFA: BLOCKED. No backend MFA contract was found.
- Shared vehicle model: PARTIAL. Explicit normalization is required.

## Test-drive dispatch grid

- Administrator booking listing: PARTIAL. A protected listing route exists, but its response and storage implementations conflict.
- Booking status vocabulary: PARTIAL. `pending`, `confirmed`, and `cancelled` are present.
- Completed status: BLOCKED. Backend support is unconfirmed.
- Status mutation route: BLOCKED. A controller exists, but a mounted protected route was not confirmed.
- Transition rules: BLOCKED. No status allowlist or legal transition graph exists.
- Idempotency and stale-update handling: BLOCKED.
- Live synchronization: BLOCKED. No approved WebSocket, server-sent event, polling, or refresh contract exists.

## Ownership

- Edwin: frontend wizard, dispatch state, interfaces, validation, adapter boundaries, accessibility, and frontend evidence.
- Ronald: batch-image upload, image ordering, interrupted-upload handling, pricing matrix, and deal-badge output.
- Max: administrator booking-status API, legal transitions, conflicts, idempotency, and audit behavior.
- Devine: device-aware sessions, session revocation, TOTP MFA, recovery behavior, and pricing-operation challenge.
- Edward: marketplace comparison requirements, range-filter behavior, shared vehicle fields, and URL parameters.

## Approved mock boundaries

- Car creation adapter: may return deterministic synthetic success, validation failure, authorization failure, and network failure.
- Upload adapter: may simulate multi-image selection, ordering, progress, partial failure, retry, and cleanup without inventing a live route.
- Dispatch adapter: may simulate booking lists, provisional legal transitions, optimistic updates, rollback, and stale responses.
- Synchronization adapter: may simulate connecting, connected, disconnected, and refreshing states without claiming a live transport contract.
- MFA boundary: may represent required, unavailable, expired, or reauthentication-required states.
- Successful production MFA verification must not be simulated as a confirmed integration.

## Mock safeguards

- Mocks must be typed and isolated behind replaceable interfaces.
- Mocks must use synthetic records only.
- Mock behavior must be deterministic for testing.
- Mock selection must be disabled by default.
- Production mock selection must be blocked.
- Components must not contain guessed live routes or event names.
- Mock results must be documented as provisional validation.

## Required collaborator follow-up

- Ronald: batch field, maximum count, file limits, ordering model, partial-failure response, cleanup behavior, pricing inputs, and deal-badge response.
- Max: protected mutation route, accepted statuses, legal transitions, request and response shape, conflict behavior, idempotency, audit fields, and delivery date.
- Devine: session-listing and revocation routes, TOTP setup and verification, recovery-code behavior, pricing challenge behavior, and delivery date.
- Edward: shared vehicle fields, comparison requirements, range-filter parameters, debounce behavior, URL parameters, and delivery date.

## Current readiness decision

- Wizard state and presentation refactoring: READY after approval.
- Typed mock adapters: READY after approval.
- Live car creation: BLOCKED by field mapping.
- Local multi-image selection and ordering: READY after approval.
- Live batch upload: BLOCKED.
- Dispatch state and board presentation: READY after approval.
- Live booking-status mutation: BLOCKED.
- Live synchronization: BLOCKED.
- MFA-protected pricing publication: BLOCKED.

## Integration rule

Frontend implementation may proceed through typed local state and isolated adapters. Live integration remains blocked until each corresponding upstream contract is published, inspected, and validated.
