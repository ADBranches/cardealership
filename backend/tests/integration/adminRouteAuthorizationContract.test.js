import assert from "node:assert/strict";
import fs from "node:fs";
import { authenticateToken, isAdmin, protect, adminOnly } from "../../middleware/authMiddleware.js";

const serverSource = fs.readFileSync(new URL("../../server.js", import.meta.url), "utf8");
const routeSource = fs.readFileSync(new URL("../../routes/adminRoutes.js", import.meta.url), "utf8");

assert.equal(protect, authenticateToken);
assert.equal(adminOnly, isAdmin);
assert.equal(serverSource.split("app.use('/api/admin'").length - 1, 1);
assert.ok(routeSource.includes("router.use(protect, adminOnly);"));
assert.ok(routeSource.indexOf("router.use(protect, adminOnly);") < routeSource.indexOf("router.get('/stats'"));

const unauthorized = { statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
await protect({ headers: {} }, unauthorized, () => assert.fail("unauthenticated request continued"));
assert.equal(unauthorized.statusCode, 401);

const forbidden = { statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
adminOnly({ user: { role: "user" } }, forbidden, () => assert.fail("non-admin request continued"));
assert.equal(forbidden.statusCode, 403);

let adminNext = 0;
adminOnly({ user: { role: "admin" } }, forbidden, () => { adminNext += 1; });
assert.equal(adminNext, 1);
console.log("ADMIN_ROUTE_AUTHORIZATION_CONTRACT=PASS");
