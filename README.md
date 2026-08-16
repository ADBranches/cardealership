
  # Car Dealership Website

  This is a code bundle for Car Dealership Website. The original project is available at https://www.figma.com/design/NPsA6njEcspPFrARnNwvCj/Car-Dealership-Website.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  ---

---

## Sprint 4 Image Cleanup Contract

Edwin's Sprint 4 backend task introduces a safe cleanup contract for stale car listing media.

A car listing is eligible for image cleanup only when all of the following are true:

- The listing status is `Draft` or `Deleted`.
- The listing has remained in that state for more than 30 days.
- The listing has associated image/media links.

The cleanup contract intentionally protects active inventory. Listings with statuses such as `Available`, `Sold`, `Pending`, `Approved`, `Published`, or `Active` must be skipped.

The cleanup timestamp fallback order is:

```text
deleted_at
drafted_at
updated_at
created_at
```

---

## Sprint 4 Image Cleanup PR Readiness

Edwin's Sprint 4 backend implementation provides a safe cleanup workflow for stale car-listing media.

### Implemented Scope

- Selects car listings with `Draft` or `Deleted` status that are older than 30 days.
- Protects active statuses such as `Available`, `Sold`, `Pending`, `Approved`, `Published`, and `Active`.
- Reads associated media through the `car_images` table and `image_url` field.
- Provides a provider-safe storage adapter with `pending`, `cloudinary`, `s3`, `firebase`, `supabase`, and `local` provider options.
- Defaults all cleanup operations to dry-run mode.
- Requires explicit flags and environment configuration before storage or database cleanup can proceed.
- Rechecks listing status and timestamp eligibility inside database removal queries.
- Provides a repeatable manual cleanup script and a scheduler-ready job.
- Keeps automatic in-process scheduling disabled until deployment-owner approval.
- Returns structured, sanitized cleanup reports with run IDs and operation counts.
- Includes repeatable manual validation covering stale, recent, active, media-free, malformed-media, dry-run, and execute-mode scenarios.

### Manual Commands

```text
cd backend
npm run test:car-image-cleanup
npm run cleanup:car-images
npm run cleanup:car-images:job
```

The execute command exists but must not be used until storage-provider behavior, production credentials, and destructive-cleanup ownership are approved:

```text
cd backend
npm run cleanup:car-images:execute
```

### Safe Defaults

```text
STORAGE_PROVIDER=pending
CLEANUP_STORAGE_DELETE_ENABLED=false
CLEANUP_CRON_ENABLED=false
CLEANUP_DRY_RUN=true
CLEANUP_OLDER_THAN_DAYS=30
CLEANUP_STATUSES=Draft,Deleted
```

### Provider-Dependent Work

Real storage deletion remains intentionally disabled. Before enabling destructive cleanup, the team must confirm the production storage provider, object identifier strategy, bucket or folder rules, credentials management, storage-versus-database deletion policy, scheduler ownership, cron schedule, production dry-run policy, and approval owner.

The backend exposes GET /api/auth/session. The endpoint requires Authorization: Bearer <access-token>, verifies the JWT, confirms that the referenced PostgreSQL user still exists, and returns the verified user. Missing, invalid, expired, and rejected sessions return unauthorized responses and cause the frontend to clear stored authentication data. Live deployment validation still requires securely configured DATABASE_URL and JWT_SECRET values.

### Routing safety contract

```text
Authentication unresolved -> render a bootstrap/loading state
Authentication ready and verified -> render protected content
Authentication ready and unauthenticated -> redirect to login
Authenticated user visiting login -> redirect to the intended destination or dashboard
```

The active router remains `src/app/App.tsx`. The unused `src/app/routes.tsx` configuration must not become a second active router during authentication implementation.

### Security rules

- Never treat local JWT decoding as authentication proof.
- Never log access tokens, JWT payloads, or authorization headers.
- Never place backend secrets in frontend environment variables.
- Clear malformed and rejected sessions safely.
- Return sanitized errors to the UI.
- Do not redirect before restoration completes.
- Preserve the requested protected destination where practical.

## Sprint 5 Authentication Persistence Validation

The authentication persistence flow is validated with deterministic in-memory storage and an injectable mock verification API contract. Validation covers login storage, refresh and browser-reopen restoration, protected-route access after successful verification, expired and invalid token cleanup, unauthorized redirects, safe network-failure handling, logout cleanup, and token-redaction checks.

Run the validation with:

```text
npm run test:auth-persistence
```

The frontend verification contract uses `GET /api/auth/session` with `Authorization: Bearer <access-token>`. The backend route and JWT authentication middleware are implemented and pass syntax validation. The deterministic persistence suite remains mock-based because live verification requires deployment-managed PostgreSQL and JWT configuration. The frontend does not use local JWT decoding as proof of authentication.

## Sprint 5 Frontend API Environment

The frontend reads its public API origin from `VITE_API_BASE_URL`. API paths are joined through `src/api/client.ts`, and trailing slashes are normalized before requests are built.

Copy `.env.example` to an ignored environment file and replace the placeholder with the deployment owner-approved API origin.

Development example:

```text
VITE_API_BASE_URL=http://localhost:5000
```

Production example:

```text
VITE_API_BASE_URL=https://approved-production-api.example.com
```

The production value above is a placeholder. A valid absolute HTTP or HTTPS URL is required at build time. Only public `VITE_` variables may be exposed to frontend code. Database URLs, JWT secrets, Cloudinary secrets, email credentials, private keys, and other backend credentials must never be placed in frontend environment files.

Validation commands:

```text
npm run test:api-config
VITE_API_BASE_URL=https://approved-production-api.example.com npm run build
```

Project demonstration:

https://youtu.be/HNtln75HTEg

## Sprint 5 Production Build Metrics

The frontend production bundle uses Vite with esbuild minification, disabled production source maps, and the standard 500 kB chunk warning threshold.

Latest validated build:

```text
Modules transformed: 1734
HTML: 0.51 kB, gzip 0.32 kB
CSS: 102.06 kB, gzip 16.19 kB
JavaScript: 322.20 kB, gzip 100.98 kB
Build duration: 3.66 seconds
Warnings: none
```

The main JavaScript asset remains below the configured warning threshold, so manual vendor chunking was not introduced. The inspected route modules are small, so route-level lazy loading was deferred to avoid unnecessary loading-state and chunk-management complexity.

Production validation confirmed:

- `VITE_API_BASE_URL` is compiled into the frontend bundle.
- No local application API endpoint is present in compiled output.
- No backend secret names were detected in compiled assets.
- No production source maps are generated.
- No test runner or React refresh tooling enters the production bundle.
- `/`, `/login`, `/register`, and `/Admin` are served by the local production preview.


## Production Deployment Handoff

This section is the authoritative Sprint 5 handoff for frontend deployment, authentication restoration, production preview, and inventory deep links.

### Public Frontend Environment

The frontend requires one public build-time variable:

```text
VITE_API_BASE_URL=https://api.example.com
```

The deployment owner must replace the example origin with the approved HTTPS API origin. Vite embeds all `VITE_` values in the browser bundle. Never place database URLs, JWT secrets, passwords, private keys, email credentials, or other server-side secrets in frontend variables.

### Development and Production Commands

Install and start development:

```bash
npm install
npm run dev
```

Build the production bundle:

```bash
VITE_API_BASE_URL=https://api.example.com npm run build
```

Preview the completed production bundle:

```bash
VITE_API_BASE_URL=https://api.example.com npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

The build rejects a missing, relative, or non-HTTP API origin. The local preview origin is `http://127.0.0.1:4173`, which must be included in the backend CORS allowlist during the local launch drill.

### Authentication Restoration Lifecycle

1. The authentication provider starts with `isRestoringSession=true` and `isAuthReady=false`.
2. The frontend reads the canonical `token` key, with temporary compatibility for `authToken`, `jwt`, and `accessToken`.
3. A missing token completes restoration as unauthenticated.
4. An existing token is sent to `GET /api/auth/session` using `Authorization: Bearer <access-token>`.
5. The backend verifies the JWT and confirms that the PostgreSQL user still exists.
6. A valid response restores the verified user and allows protected-route access.
7. Missing, invalid, expired, rejected, or deleted-user sessions clear stored authentication data.
8. Protected routes wait until `isAuthReady=true` before allowing or redirecting navigation.

### Token Storage Policy

```text
Canonical access-token key: token
Canonical user key: user
Storage mechanism: localStorage
Legacy token keys: authToken, jwt, accessToken
Legacy role keys: role, isAdmin
```

Logout and failed verification remove canonical and legacy authentication keys. Access tokens, JWT payloads, passwords, and authorization headers must never be logged or exposed in UI errors.

### Inventory Deep Links

Inventory filters synchronize with these URL parameters:

```text
brand=Toyota
year=2023
maxPrice=300000000
```

Example:

```text
/search?brand=Toyota&year=2023&maxPrice=300000000
```

Direct navigation restores the filter values. Filter changes update the URL, browser navigation restores earlier query states, and resetting filters clears the query string.

### Latest Validated Build

```text
Build tool: Vite 6.4.3
Modules transformed: 1734
HTML: 0.51 kB, gzip 0.32 kB
CSS: 102.06 kB, gzip 16.19 kB
JavaScript: 322.20 kB, gzip 100.98 kB
Production source maps: disabled
Minifier: esbuild
Chunk warning threshold: 500 kB
Warnings: none
```

### Launch Drill Result

Verified locally:

- Production build succeeds.
- Production preview serves public, protected, and deep-linked SPA routes.
- Compiled JavaScript and CSS assets return HTTP 200.
- The configured API origin is compiled into the frontend bundle.
- No local application API endpoint or backend secret name was detected in compiled assets.
- Authentication, persistence, protected-route, API configuration, and vehicle-filter tests pass.
- The backend health endpoint returns HTTP 200.
- Missing-token session verification returns HTTP 401.
- The admin statistics endpoint requires authentication.
- The approved preview origin passes CORS and an unapproved origin is rejected.

### Known Limitations and Team Dependencies

- Live login, valid-token restoration, live inventory, database seeding, and indexed-search validation require deployment-managed `DATABASE_URL` and `JWT_SECRET` values.
- The real hosted HTTPS API origin must replace the documentation example before the release build.
- Devine owns the secured API, deployment JWT configuration, and production CORS origin.
- Ronald and Max own representative inventory and booking data, database readiness, and search indexes.
- Edward owns optimized-image rendering, fixed image layouts, and browser validation of shared deep links.
- Edwin owns the frontend release build, production preview, authentication restoration checks, and browser console and network inspection.
- Browser console, mobile viewport, valid live session, remote database inventory, and production network behavior remain part of the final live drill.

### Authentication Rollback Guidance

If authentication restoration causes a release-blocking regression:

1. Roll back to the last known-good frontend deployment.
2. Do not bypass protected routes or trust an unverified stored token.
3. Verify that `GET /api/auth/session` returns the expected user for a valid token.
4. Verify that invalid and expired sessions clear stored authentication data.
5. Run `npm run test:auth`, `npm run test:auth-persistence`, and `npm run test:protected-route`.
6. Record the failing endpoint, HTTP status, browser error, and deployed bundle version.

### Deployment Handoff Checklist

- [ ] Set the real `VITE_API_BASE_URL` for the release build.
- [ ] Configure backend `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, and `PORT` through the deployment secret store.
- [ ] Verify approved-origin CORS and rejection of an unapproved origin.
- [ ] Verify live login, refresh restoration, browser reopen, expired-session cleanup, and logout.
- [ ] Verify live inventory, optimized images, deep links, and mobile layout.
- [ ] Inspect the browser console and network panel for release-blocking failures.
- [ ] Record final build metrics, frontend origin, API origin, and launch-drill results in the pull request.
