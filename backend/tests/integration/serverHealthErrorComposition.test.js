import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../../server.js", import.meta.url), "utf8");
for (const prefix of ["/api/auth", "/api/cars", "/api/bookings", "/api/admin"]) {
  assert.equal(source.split(`app.use('${prefix}'`).length - 1, 1, `${prefix} must be mounted exactly once`);
}
const firstRouterIndex = source.indexOf("app.use('/api/auth'");
const notFoundIndex = source.indexOf("code: 'NOT_FOUND'");
const errorIndex = source.indexOf("code = err.code");
assert.ok(firstRouterIndex >= 0);
assert.ok(notFoundIndex > firstRouterIndex);
assert.ok(errorIndex > notFoundIndex);
assert.ok(source.includes("console.info('Incoming request'"));
assert.ok(source.includes("console.error('Unhandled error'"));
assert.ok(source.includes("'INTERNAL_SERVER_ERROR'"));
assert.ok(source.includes("code: 'NOT_FOUND'"));
assert.ok(source.includes("success: true"));
assert.ok(!/app\.(get|post|put|patch|delete)\(\s*['\"]\/api\/(auth|cars|bookings|admin)(?:\/|['"])/.test(source));
console.log("SERVER_HEALTH_ERROR_COMPOSITION_TEST=PASS");
