"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createAuthenticationMiddleware } = require("../../../middleware/authenticate");
const { authorizeAdministrator } = require("../../../middleware/authorizeAdministrator");
const { USER_ROLES } = require("../../../models/User");

const createResponse = () => {
  const activity = {};
  return {
    activity,
    status(statusCode) {
      activity.statusCode = statusCode;
      return this;
    },
    json(body) {
      activity.body = body;
      return this;
    }
  };
};

test("missing bearer token returns HTTP 401", () => {
  const middleware = createAuthenticationMiddleware({
    secret: "test-secret",
    verifyToken: () => ({})
  });
  const response = createResponse();
  middleware({ headers: {} }, response, () => assert.fail("next must not execute"));
  assert.equal(response.activity.statusCode, 401);
  assert.equal(response.activity.body.error.code, "AUTH_TOKEN_REQUIRED");
});

test("valid token exposes immutable authenticated user", () => {
  const middleware = createAuthenticationMiddleware({
    secret: "test-secret",
    verifyToken: () => ({ id: "user-1", email: "admin@example.com", role: USER_ROLES.ADMINISTRATOR })
  });
  const request = { headers: { authorization: "Bearer valid-token" } };
  const response = createResponse();
  let nextCalls = 0;
  middleware(request, response, () => { nextCalls += 1; });
  assert.equal(nextCalls, 1);
  assert.equal(request.user.role, USER_ROLES.ADMINISTRATOR);
  assert.equal(Object.isFrozen(request.user), true);
});

test("customer role is denied administrator access", () => {
  const response = createResponse();
  authorizeAdministrator({ user: { role: USER_ROLES.CUSTOMER } }, response, () => assert.fail("next must not execute"));
  assert.equal(response.activity.statusCode, 403);
  assert.equal(response.activity.body.error.code, "ADMINISTRATOR_REQUIRED");
});

test("administrator role is authorized", () => {
  let nextCalls = 0;
  authorizeAdministrator({ user: { role: USER_ROLES.ADMINISTRATOR } }, createResponse(), () => { nextCalls += 1; });
  assert.equal(nextCalls, 1);
});

test("new users default to the customer role", () => {
  const User = require("../../../models/User");
  const user = new User({ name: "Test User", email: "test@example.com", password: "hash" });
  assert.equal(user.role, USER_ROLES.CUSTOMER);
});
