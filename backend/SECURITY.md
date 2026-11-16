# Backend security and credential rotation

## Runtime configuration

- Keep `.env` files local or in the deployment provider's secret manager. Commit only example templates. Do not add secrets to `VITE_*` variables; they are public browser configuration.
- In production, provide a securely generated `JWT_SECRET` of at least 32 bytes and an explicit comma-separated `CORS_ALLOWED_ORIGINS` list of HTTPS frontend origins (no trailing slash, paths, credentials, or wildcard).
- The legacy in-memory sample database is intentionally disabled in production. Use the canonical persistence layer for live routes.

## Historical credential exposure

Removing environment files from Git tracking does not revoke credentials already exposed. An authorized administrator must inventory historical and deployment credentials, rotate exposed database credentials, JWT signing secrets and any affected provider credentials, update the deployed secret configuration, test access using replacement credentials, and revoke old credentials. Rotation of the signing secret invalidates existing JWTs; plan reauthentication accordingly. Rotation is not confirmed by a passing source-code test.

Record only the credential category, rotation date, responsible owner and verification outcome; do not record the old or new secret. Coordinate any history rewrite separately with repository maintainers after rotation.

## Administrator account reset

An authorized operator can run `node reset-admin.js` from the backend directory with `ADMIN_RESET_EMAIL` and `ADMIN_RESET_PASSWORD` provided via the process environment. Use a unique password of at least 14 characters and no more than 72 UTF-8 bytes. The script refuses to promote an existing non-admin account, and does not print the password. Avoid shell history, output logs, and persistent reset passwords. Do not run the reset against a shared deployment without authorization.
