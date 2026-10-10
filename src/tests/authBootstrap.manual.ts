import assert from "node:assert/strict";
import { createAuthenticatedState, createUnauthenticatedState } from "../app/context/auth";

const session = { accessToken: "test-token", user: { id: "12", email: "user@example.com", role: "user" } };
const authenticated = createAuthenticatedState(session);
assert.equal(authenticated.isAuthenticated, true);
assert.equal(authenticated.isAuthReady, true);
assert.equal(authenticated.isRestoringSession, false);
assert.deepEqual(authenticated.user, session.user);
assert.equal(authenticated.accessToken, session.accessToken);

const missing = createUnauthenticatedState();
assert.equal(missing.isAuthenticated, false);
assert.equal(missing.isAuthReady, true);
assert.equal(missing.isRestoringSession, false);
assert.equal(missing.user, null);
assert.equal(missing.accessToken, null);

const failure = createUnauthenticatedState({ code: "TOKEN_EXPIRED", message: "Session expired." });
assert.equal(failure.isAuthenticated, false);
assert.equal(failure.isAuthReady, true);
assert.equal(failure.error?.code, "TOKEN_EXPIRED");
assert.equal(JSON.stringify(failure).includes(session.accessToken), false);

console.log(JSON.stringify({ suite: "authBootstrap", passed: 14, failed: 0, loadingExited: true, tokenLogged: false }, null, 2));
