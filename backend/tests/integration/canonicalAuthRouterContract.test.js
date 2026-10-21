import assert from "node:assert/strict";
import fs from "node:fs";

const serverSource = fs.readFileSync(new URL("../../server.js", import.meta.url), "utf8");
const routeSource = fs.readFileSync(new URL("../../routes/authRoutes.js", import.meta.url), "utf8");
const controllerSource = fs.readFileSync(new URL("../../controllers/authController.js", import.meta.url), "utf8");

assert.equal(serverSource.split("app.use('/api/auth'").length - 1, 1);
assert.ok(!/app\.(get|post|put|patch|delete)\(\s*['\"]\/api\/auth/.test(serverSource));

for (const route of [
  "router.post('/register', authController.register)",
  "router.post('/login', rateLimitLogin, authController.login)",
  "router.post('/logout', authController.logout)",
  "router.get('/me', authenticateToken, authController.me)",
  "router.get('/session', authenticateToken, authController.me)",
  "router.post('/refresh', authenticateToken, authController.refreshToken)",
  "router.put('/change-password', authenticateToken, authController.changePassword)",
  "router.get('/users', authenticateToken, isAdmin, authController.getAllUsers)",
  "router.delete('/users/:id', authenticateToken, isAdmin, authController.deleteUser)",
]) assert.ok(routeSource.includes(route), `missing canonical route: ${route}`);

for (const handler of ["register", "login", "logout", "me", "refreshToken", "changePassword", "getAllUsers", "deleteUser"]) {
  assert.ok(controllerSource.includes(`function ${handler}`), `missing canonical handler: ${handler}`);
}
assert.ok(!routeSource.includes("mock"));
console.log("CANONICAL_AUTH_ROUTER_CONTRACT=PASS");
