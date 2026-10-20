import assert from "node:assert/strict";
import fs from "node:fs";

const serverSource = fs.readFileSync(new URL("../../server.js", import.meta.url), "utf8");
const mounts = [
  ["authRoutes", "/api/auth"],
  ["carsRoutes", "/api/cars"],
  ["bookingRoutes", "/api/bookings"],
  ["adminRoutes", "/api/admin"],
];

for (const [routerName, prefix] of mounts) {
  assert.ok(serverSource.includes(`import ${routerName} from `), `${routerName} import missing`);
  assert.ok(serverSource.includes(`app.use('${prefix}', ${routerName});`), `${routerName} mount missing`);
  assert.equal(serverSource.split(`app.use('${prefix}'`).length - 1, 1, `${prefix} must be mounted once`);
}

assert.ok(serverSource.includes("app.get('/api/health'"), "health endpoint missing");
assert.ok(serverSource.includes("res.status(404).json"), "not-found handler missing");
assert.ok(serverSource.includes("app.use((err, req, res, next)"), "central error handler missing");

const routeIndex = serverSource.indexOf("app.use('/api/auth'");
const notFoundIndex = serverSource.indexOf("res.status(404).json");
const errorIndex = serverSource.indexOf("app.use((err, req, res, next)");
assert.ok(routeIndex >= 0 && routeIndex < notFoundIndex, "routers must precede not-found handling");
assert.ok(notFoundIndex >= 0 && notFoundIndex < errorIndex, "not-found handling must precede error handling");

console.log("BACKEND_ROUTE_COMPOSITION_TEST=PASS");
