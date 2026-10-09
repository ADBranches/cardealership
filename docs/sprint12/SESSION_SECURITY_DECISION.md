# Session Security Decision

## Current decision

The current release retains the canonical access token in local storage as a temporary compatibility boundary. Local storage is exposed to token theft when malicious script execution occurs, so token values must never appear in logs, error objects, analytics, rendered diagnostics, or test output.

Server-side token-version enforcement is mandatory. Password reset, password change, and approved account-state changes increment `token_version`; protected requests compare the JWT `tokenVersion` with the current PostgreSQL value. Expired, malformed, revoked, and version-mismatched tokens return safe HTTP 401 responses.

## Canonical client behavior

The authentication context is the authority for active application paths. Unauthorized API responses clear canonical and legacy keys through one session guard. Protected and administrator routes wait for context readiness and never grant access from standalone local-storage role flags.

## Approved migration path

The preferred future state is a `Secure`, `HttpOnly`, appropriately `SameSite` cookie. Migration requires CSRF protection, credentialed CORS configuration, token rotation and revocation design, coordinated frontend and backend deployment, and rollback evidence. Cookie migration is outside the current phase and must not be partially enabled.
