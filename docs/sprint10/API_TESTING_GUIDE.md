# Sprint 10 API Testing Guide

## Scope
Covers registration, login, vehicle listing, test-drive booking, and administrator statistics.

## Prerequisites
1. Configure PostgreSQL and `backend/.env`.
2. Start the backend from `backend/` with `npm run dev`.
3. Confirm `http://localhost:5500/api/health` is reachable.
4. Open `src/tests/sprint10-required-endpoints.http` in an HTTP client.

## Safety
Replace password and token placeholders only in a local untracked copy. Never commit real JWTs, passwords, secrets, or database URLs.

## Execution order
1. Register once, then repeat to test HTTP 409.
2. Log in and keep temporary tokens locally.
3. Run login negative cases.
4. Run cars requests.
5. Run test-drive cases.
6. Run admin authorization cases.

## Verified limitations
- Registration does not validate email format.
- `GET /api/cars` does not implement server filtering or sorting.
- Test-drive date, time, and phone formats are not validated.
- Test-drive persistence and conflict enforcement are not implemented.
- Phone is optional.

## Expected statuses
- Registration: 201, missing field 400, duplicate 409.
- Login: 200, invalid credentials 401, missing field 400.
- Cars list: 200.
- Test drive: 201, missing required value 400.
- Admin stats: missing or invalid token 401, non-admin 403, admin 200.

## Live-test blocker policy
If PostgreSQL or the backend is unavailable, record live testing as blocked. Structural request validation is not a substitute for live endpoint results.
