# Sprint 10 Setup and Runtime Audit

## Scope

This audit records the verified frontend and backend runtime requirements for Sprint 10.

## Package manager and lockfiles

- npm is the package manager.
- The frontend uses the root `package.json` and `package-lock.json`.
- The backend uses `backend/package.json` and `backend/package-lock.json`.
- Frontend and backend dependencies must be installed from their respective directories.

## Frontend runtime

- The frontend is a Vite application.
- Run `npm install` from the repository root.
- Run `npm run dev` to start frontend development.
- Run `npm run build` to create the production frontend bundle.
- Run `npm run preview` to preview the production bundle.
- Public frontend configuration uses `VITE_` environment variables.

## Backend runtime

- The backend entry point is `backend/server.js`.
- Run `npm install` from `backend/`.
- Run `npm run dev` or `npm start` from `backend/`.
- The backend uses PostgreSQL through the `pg` package.
- Authentication requires `JWT_SECRET`.
- Database connectivity uses `DATABASE_URL` or the documented `DB_` connection variables.

## Verified package corrections

- Duplicate `cors`, `dotenv`, and `express` keys were removed.
- The retained declarations are `cors` 2.8.6, `dotenv` 17.4.2, and `express` 5.2.1 ranges.
- The invalid backend `vite build` command was replaced.
- The backend build gate now runs `node --check server.js`.
- The backend does not require a Vite browser bundle or `index.html`.

## Environment contract

- `backend/.env.example` documents environment-variable names required by active backend code.
- Tracked example files contain placeholders or safe local defaults.
- Real passwords, tokens, private keys, and service secrets must remain in ignored local files.

## Startup order

1. Install frontend dependencies from the repository root.
2. Install backend dependencies from `backend/`.
3. Create local environment files from the tracked examples.
4. Configure PostgreSQL and required backend secrets.
5. Start the backend from `backend/`.
6. Start the frontend from the repository root.
7. Run tests and the frontend production build.

## Database behavior

- Database initialization occurs during backend startup.
- Database-dependent validation requires a valid PostgreSQL connection.
- A missing database dependency must be reported as a blocker, not a pass.

## CORS contract

- The frontend origin and backend CORS configuration must remain aligned.
- Production deployments must use approved origins.

## Validation status

- Package manifests and lockfiles must parse successfully.
- The backend build gate must return status zero.
- Every active backend environment reference must be documented.
- Final Phase 1 validation must pass before commit.
