# Car Dealership

A full-stack vehicle dealership application with inventory browsing, authentication, test-drive scheduling, administration features, reporting, and supporting operational tools.

## Technology stack

- Frontend: React, TypeScript, and Vite.
- Backend: Node.js and Express.
- Database: PostgreSQL through the `pg` package and the repository database adapter.
- Authentication: JSON Web Tokens and bcrypt password hashing.
- Package manager: npm with separate frontend and backend lockfiles.

## Repository structure

```text
.
|-- src/                       Frontend application and manual tests
|-- backend/                   Express API and backend services
|-- backend/routes/            Express route definitions
|-- backend/controllers/       Request handlers
|-- backend/config/            Database and service configuration
|-- backend/tests/             Backend validation files
|-- docs/sprint10/             Sprint 10 audit and planning records
|-- package.json               Frontend scripts and dependencies
|-- backend/package.json       Backend scripts and dependencies
`-- .env.example               Public frontend configuration example
```

## Prerequisites

- Node.js and npm.
- PostgreSQL available locally or through an approved development environment.
- A configured backend JWT secret.
- Separate frontend and backend environment files created from the tracked examples.

## Frontend installation

From the repository root:

```bash
npm install
```

Start frontend development:

```bash
npm run dev
```

Vite normally serves the frontend at `http://localhost:5173`.

## Backend installation

From the repository root:

```bash
cd backend
npm install
```

Start the backend:

```bash
npm run dev
```

The backend defaults to `http://localhost:5500` when `PORT` is not overridden.

## Frontend environment setup

Copy the frontend example into an ignored local environment file:

```bash
cp .env.example .env.local
```

For local development, set:

```dotenv
VITE_API_BASE_URL=http://localhost:5500
```

Only public `VITE_` variables belong in frontend environment files. Never place database credentials, JWT secrets, email credentials, private keys, or service secrets in frontend variables.

## Backend environment setup

Create the local backend environment file:

```bash
cp backend/.env.example backend/.env
```

At minimum, configure:

```dotenv
PORT=5500
DATABASE_URL=postgresql://database-user:database-password@localhost:5432/car_dealership
JWT_SECRET=replace-with-a-long-random-secret
SITE_URL=http://localhost:5173
```

Keep the real `.env` file untracked.

## Database requirements

The backend requires PostgreSQL for persistent users, inventory, and database-backed features. Create the configured database and grant the configured account the required privileges before starting live API validation.

Database-dependent endpoints must not be reported as working when PostgreSQL is unavailable. Record database connection failures as environment blockers.

## Development startup order

1. Install root frontend dependencies.
2. Install dependencies inside `backend/`.
3. Create local frontend and backend environment files.
4. Start PostgreSQL.
5. Start the backend from `backend/`.
6. Start the frontend from the repository root.
7. Run manual API requests and deterministic tests.

## API base URL

The default local API origin is:

```text
http://localhost:5500
```

The examples below use this origin.

## Sprint 10 required API endpoints

### POST /api/auth/register

Registers a user and returns a signed token with the created user summary.

Required fields are `name`, `email`, and `password`. The optional `role` accepts `user` or `admin`; unsupported values are normalized to `user` by the current controller.

```http
POST http://localhost:5500/api/auth/register
Content-Type: application/json

{
  "name": "API Test User",
  "email": "api-test-user@example.com",
  "password": "replace-with-a-test-password",
  "role": "user"
}
```

Successful registration returns HTTP `201` with `success`, `message`, `token`, and `user`. Missing required fields return HTTP `400`. An existing email returns HTTP `409`. Unexpected processing failures return HTTP `500`.

### POST /api/auth/login

Authenticates an existing user and returns a signed token with the verified user summary.

```http
POST http://localhost:5500/api/auth/login
Content-Type: application/json

{
  "email": "api-test-user@example.com",
  "password": "replace-with-a-test-password"
}
```

Successful login returns HTTP `200` with `success`, `message`, `token`, and `user`. Missing fields return HTTP `400`. Unknown users and incorrect passwords return HTTP `401` with the same invalid-credential message.

### GET /api/cars

Returns the public vehicle inventory. Authentication is not required.

```http
GET http://localhost:5500/api/cars
```

The current backend controller does not consume query parameters for this endpoint. Filtering and sorting may be performed by frontend behavior, but unsupported server query parameters must not be documented as backend features.

A successful response returns HTTP `200` with `success`, `count`, and `cars`. An empty inventory returns `count: 0` and an empty `cars` array. Database or repository failures return HTTP `500` with error code `FETCH_CARS_FAILED`.

### POST /api/test-drives

Validates and confirms a test-drive request. This route is currently public.

Required values are customer name, customer email, either vehicle name or vehicle ID, appointment date, and appointment time. `phone` and `notes` are accepted as optional values. The controller accepts `name` or `customerName`, `email` or `customerEmail`, `date` or `appointmentDate`, and `time` or `appointmentTime`.

```http
POST http://localhost:5500/api/test-drives
Content-Type: application/json

{
  "customerName": "API Test User",
  "customerEmail": "api-test-user@example.com",
  "phone": "+256700000000",
  "vehicleId": "1",
  "vehicleName": "Selected vehicle",
  "appointmentDate": "2026-10-01",
  "appointmentTime": "10:00",
  "notes": "Manual Sprint 10 API test"
}
```

Successful validation returns HTTP `201` with a generated reference, `confirmed` status, booking details, and notification outcome. Missing required values return HTTP `400` with an `errors` array.

The current controller creates a confirmation response but does not yet persist the booking or enforce schedule conflicts. Notification failure does not cancel confirmation; notification status is returned separately.

### GET /api/admin/stats

Returns administrative totals and grouped statistics. The endpoint requires a valid JWT whose payload has the `admin` role.

```http
GET http://localhost:5500/api/admin/stats
Authorization: Bearer replace-with-admin-access-token
```

A successful response returns `success`, a `stats` object, and a timestamp. The statistics include revenue, bookings, inventory count, average price, sales, users, recent bookings, grouped bookings, monthly sales, recent sales, and currency.

A missing, invalid, or expired token returns HTTP `401`. A valid non-admin token returns HTTP `403`. Data-access failures return HTTP `500`.

## Authentication and administrator authorization

Protected endpoints expect:

```text
Authorization: Bearer access-token
```

Authentication verifies the JWT and attaches its payload to the request. Administrator routes additionally require `role: admin` in the verified token payload.

Never commit real access tokens. Use temporary local tokens obtained through the login endpoint.

## Manual API testing

Manual HTTP request files are available at:

- `src/requests.http`
- `src/tests/cars.http`
- `src/tests/test-drives.http`

Open a request file in an HTTP-client-enabled editor, confirm the local API origin, start PostgreSQL and the backend, then execute requests individually. Replace placeholders locally without committing credentials.

## Automated validation commands

Run the frontend regression suite:

```bash
npm run test:regression
```

Run API configuration validation:

```bash
npm run test:api-config
```

Run the backend image-cleanup validation:

```bash
npm --prefix backend run test:car-image-cleanup
```

## Production build

Build the frontend from the repository root:

```bash
npm run build
```

Run the backend syntax build gate:

```bash
npm --prefix backend run build
```

Preview the frontend build:

```bash
npm run preview
```

## Troubleshooting

- Connection refused: confirm PostgreSQL and the backend are running and verify port `5500`.
- Frontend requests target the wrong server: set `VITE_API_BASE_URL=http://localhost:5500` and restart Vite.
- Unauthorized response: obtain a fresh token through login and use the Bearer scheme.
- Forbidden administrator response: use a verified administrator account.
- Database errors: verify `DATABASE_URL` or the documented `DB_` variables.
- Email notification skipped: confirm the configured provider and email credentials.
- Build failure: run installation separately in the root and `backend/` directories.

## Security notes

- Never commit `.env` files containing credentials.
- Never expose `JWT_SECRET`, database passwords, email passwords, private keys, or provider secrets in frontend variables.
- Never commit real Bearer tokens in HTTP examples.
- Use a strong deployment-managed JWT secret.
- Use approved CORS origins in production.
- Keep PostgreSQL credentials least-privileged.
- The current authentication middleware contains a development fallback secret when `JWT_SECRET` is absent. Production environments must always provide `JWT_SECRET`.

---

## Earlier sprint implementation notes

The historical sections below are retained for implementation context. The Sprint 10 setup and API documentation above is the authoritative contributor setup flow.


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

Chat mock modes are disabled by default. Synthetic chat requires explicit local opt-in and cannot be selected in a production build. Live gateway integration remains unavailable until the transport owner publishes the approved protocol.

## Sprint 8 Validation

Run `npm run test:sprint8-full` for the complete Sprint 8 targeted and affected regression suites. Production builds must disable every mock mode, use the approved HTTPS API origin, and restore generated `dist` assets after inspection. Detailed evidence is available in `docs/sprint8/sprint8-validation-report.md`.

## Sprint 8 Administrator Workflows

The administrator vehicle-listing wizard, dispatch board, and responsive sign-in experience are covered by `npm run test:sprint8-full` and `npm run test:login-interface`. Deployment requirements, blocked integration-owner dependencies, rollback guidance, and the reviewer summary are maintained under `docs/sprint8/`.
