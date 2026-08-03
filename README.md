
  # Car Dealership Website

  This is a code bundle for Car Dealership Website. The original project is available at https://www.figma.com/design/NPsA6njEcspPFrARnNwvCj/Car-Dealership-Website.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  

## Sprint 5 Authentication Persistence Contract

Edwin's Sprint 5 frontend work will consolidate the existing local-storage authentication helpers into one authoritative session-restoration flow. This section defines the contract only. The provider, storage service, protected-route guard, and backend verification integration are implemented in later phases.

### Authoritative authentication state

```text
user: verified user or null
accessToken: stored access token or null
isAuthenticated: true only after backend verification succeeds
isRestoringSession: true while startup verification is running
isAuthReady: true only after restoration has completed
error: sanitized authentication error or null
```

State invariants:

- `isRestoringSession=true` requires `isAuthReady=false`.
- The router must not redirect while `isAuthReady=false`.
- `isAuthenticated=true` requires both a verified user and an access token.
- Failed, expired, malformed, or rejected sessions clear the user and token.
- Logout clears every recognized authentication storage key.

### Session restoration sequence

1. The application starts with session restoration active.
2. The canonical `token` key is read first.
3. Legacy token keys `authToken`, `jwt`, and `accessToken` may be read temporarily for compatibility.
4. A missing token completes restoration as unauthenticated.
5. An existing token is sent to the backend using `Authorization: Bearer <access-token>`.
6. A successful backend response restores the verified user.
7. An unauthorized, expired, malformed, or rejected session clears stored authentication data.
8. Restoration completes in a `finally` path.
9. `isAuthReady` becomes true.
10. The router renders the correct public or protected destination.

### Storage policy

```text
Canonical access-token key: token
Canonical user key: user
Legacy token keys: authToken, jwt, accessToken
Legacy role keys: role, isAdmin
Storage mechanism: localStorage
```

A valid legacy token may be migrated to the canonical `token` key during restoration. Invalid-session cleanup and logout must remove canonical and legacy authentication keys. JWT values must never be written to logs or user-facing error messages.

### Backend verification contract

Backend verification is authoritative. The frontend must not decode a JWT and treat its payload as proof of validity.

Expected request:

```text
Method: pending Devine confirmation
Endpoint: pending Devine confirmation
Authorization: Bearer <access-token>
```

Expected successful result:

```text
valid: true
user: { id, email, name?, role?, isAdmin? }
```

Expected failure result:

```text
valid: false
code: UNAUTHORIZED | TOKEN_EXPIRED | INVALID_TOKEN | SESSION_VERIFICATION_FAILED
message: optional sanitized message
```

The current backend contains login routes and JWT authentication middleware, but it does not yet expose a confirmed session-verification route. Devine must confirm the endpoint, HTTP method, response shape, invalid-token behavior, expired-token behavior, and refresh-token policy before live restoration is connected.

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

Live backend verification remains pending Devine confirmation. The expected frontend endpoint is `GET /api/auth/session` with `Authorization: Bearer <access-token>`. The current backend does not expose that route, and `backend/middleware/authMiddleware.js` contains unresolved merge-conflict markers. The frontend does not use local JWT decoding as proof of authentication.
