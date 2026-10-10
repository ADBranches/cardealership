# Sprint 7 Admin Chat Rollback Plan

## Rollback triggers

Use rollback when the admin inbox causes a release-blocking regression, authorization is bypassed, unread counts become unreliable, message duplication occurs, the transport exposes private information, or production unexpectedly selects synthetic chat data.

## Immediate containment

1. Stop the affected frontend deployment.
2. Restore the last administrator-approved frontend release.
3. Do not bypass protected routes or weaken administrator authorization.
4. Keep chat mock flags disabled in production.
5. Do not delete transcript records while investigating frontend behavior.
6. Record the deployed frontend commit, public environment names, route status codes, and sanitized error details.

## Frontend rollback procedure

1. Identify the last known-good deployment commit.
2. Revert the Sprint 7 change through the repository review workflow.
3. Rebuild with approved HTTPS origins and all mock flags set to false.
4. Verify `/Admin/chat` is unavailable or restored to the approved implementation.
5. Confirm public and existing protected routes still work.
6. Run authentication, protected-route, persistence, profile, booking, availability, filtering, and API-configuration tests.

Do not merge, force-push, or resolve upstream conflicts without repository-administrator approval.

## Feature-level containment

If full deployment rollback is unnecessary:

- Remove or hide the admin chat navigation entry through an approved follow-up change.
- Keep the provider from initializing for unauthorized users.
- Keep live transport unavailable until its protocol is confirmed.
- Leave transcript routes untouched unless the backend owner separately approves a backend rollback.
- Preserve message and unread evidence without recording private transcript contents.

## Data and persistence safety

- Do not truncate or alter the transcript table as part of frontend rollback.
- Do not replay failed messages without an approved idempotency contract.
- Do not reset persisted unread state without the backend owner.
- Do not copy access tokens or transcript bodies into issues, commits, screenshots, or rollback documentation.

## Verification after rollback

Run:

```bash
npm run test:auth
npm run test:protected-route
npm run test:auth-persistence
npm run test:regression
npm run build
```

Confirm:

- The working tree is clean.
- Local and remote commit hashes match.
- Generated assets are not staged.
- No source maps or private configuration values are present.
- Existing frontend features remain operational.

## Ownership

- Repository administrator: merge, revert, and release approval.
- Edwin: frontend diagnosis, validation evidence, and approved rollback implementation.
- Edward: customer-widget behavior.
- Devine: gateway transport and real-time behavior.
- Ronald: transcript persistence and history behavior.

## Recovery

Re-enable live chat integration only after the failed behavior is reproduced, corrected, reviewed, and validated against compatible upstream contracts in one shared environment.
