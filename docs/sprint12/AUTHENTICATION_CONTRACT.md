# Sprint 12 Authentication Contract

## Canonical persistence

Authentication uses PostgreSQL through `backend/repositories/authRepository.js`. The files under `backend/models/` are compatibility facades only. Authentication controllers must not use Mongoose or a document database.

## Public user shape

Only `id`, `name`, `email`, `role`, `emailVerified`, and `emailVerifiedAt` may be returned. Password hashes, token hashes, lockout counters, and session-version internals are never public.

## Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/session`
- `POST /api/auth/logout`
- `GET /api/auth/verify-email`
- `POST /api/auth/resend-verification`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

## Success response

```json
{ "success": true, "message": "Safe public message", "data": {} }
```

## Error response

```json
{ "success": false, "error": { "code": "STABLE_CODE", "message": "Safe public message", "status": 400, "details": null } }
```

Internal exceptions, SQL text, stack traces, passwords, authorization headers, access tokens, verification tokens, reset tokens, and token hashes must never be returned.

## Security state

- Email verification is represented by `email_verified` and `email_verified_at`.
- Verification and reset tokens are stored only as hashes with expiries.
- `token_version` supports session invalidation after password or account-security changes.
- `password_updated_at` records credential rotation.
- `failed_login_attempts` and `locked_until` provide durable lockout integration points.
- Existing users remain compatible through safe column defaults.
- Existing `role` values remain part of JWT and public user contracts so administrator authorization is preserved.

## Upstream review decision

The upstream authentication commit was not merged because it uses a document-style `db.collection()` API while this branch uses PostgreSQL, allows a client-provided administrator role during registration, removes the dedicated administrator route guard, and returns internal exception messages. Safe ideas were documented, but incompatible implementation code was not integrated.
