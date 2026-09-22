# Sprint 8 Deployment Handoff

## Delivered workflows

- Multi-step administrator vehicle-listing wizard with validation, ordered image selection, recoverable publication, and inventory return.
- Administrator dispatch board with verified booking statuses, legal actions, optimistic rollback, stale-response protection, and manual-refresh synchronization.
- Modern responsive sign-in interface with protected redirect preservation, explicit labels, password visibility control, and secure session messaging.

## Required deployment configuration

- Set `VITE_API_BASE_URL` to the approved HTTPS API origin.
- Keep listing, dispatch, profile, availability, and chat mock flags disabled.
- Provide `JWT_SECRET` through the protected backend secret store. No fallback secret is supported.
- Deploy a backend commit containing the authenticated administrator booking-list and status-mutation contracts.
- Never commit integration credentials or private environment files.

## Integration-owner responsibilities

The integration owner must provide the shared frontend URL, shared API URL, exact deployed backend commit, synthetic administrator account through a secure channel, and a two-view environment for synchronization verification. Phase 13 live walkthroughs remain blocked until those dependencies exist. Local or synthetic validation must not be reported as deployed success.

## Deployment sequence

1. Confirm the frontend and backend commits selected for deployment.
2. Configure approved environment values and secret-store references.
3. Run `npm run test:sprint8-full`.
4. Run the production build with every mock flag set to `false`.
5. Inspect compiled assets for source maps, local origins, mock activation, and sensitive values.
6. Deploy backend and frontend artifacts to the shared environment.
7. Complete the listing and dispatch integration walkthroughs using synthetic records only.
8. Record sanitized HTTP, persistence, upload, transition, and synchronization evidence.

## Current readiness

Repository-level targeted tests, affected regressions, security checks, accessibility checks, and production-build validation passed. The shared-environment walkthrough is accurately recorded as blocked and is owned by the integration and deployment workstream.
