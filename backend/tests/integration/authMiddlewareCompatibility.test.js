import assert from "node:assert/strict";
import {
  authenticateToken,
  isAdmin,
  protect,
  adminOnly,
  requireAdmin,
} from "../../middleware/authMiddleware.js";

assert.equal(protect, authenticateToken, "protect must preserve canonical token authentication");
assert.equal(adminOnly, isAdmin, "adminOnly must preserve canonical administrator authorization");
assert.equal(requireAdmin, isAdmin, "requireAdmin must preserve canonical administrator authorization");

const deniedResponse = {
  statusCode: 200,
  body: null,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
};
adminOnly({ user: { role: "customer" } }, deniedResponse, () => assert.fail("non-admin must not continue"));
assert.equal(deniedResponse.statusCode, 403);

let nextCalls = 0;
adminOnly({ user: { role: "admin" } }, deniedResponse, () => { nextCalls += 1; });
assert.equal(nextCalls, 1);

console.log("AUTH_MIDDLEWARE_COMPATIBILITY_TEST=PASS");
