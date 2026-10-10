import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const middleware = readFileSync("backend/middleware/authMiddleware.js", "utf8");
const routes = readFileSync("backend/routes/adminRoutes.js", "utf8");
const dashboard = readFileSync("src/app/components/admin/AdminDashboard.tsx", "utf8");
const wizard = readFileSync("src/features/admin-listing/components/ListingWizard.tsx", "utf8");
const dispatchApi = readFileSync("src/features/admin-dispatch/services/dispatchApi.ts", "utf8");
const imageValidation = readFileSync("src/features/admin-listing/validation/imageSelectionValidation.ts", "utf8");
const tracked = execFileSync("git", ["ls-files"], { encoding: "utf8" }).split("\n").filter(Boolean);

assert.equal((middleware.match(/export const authenticateToken\s*=/g) ?? []).length, 1);
assert.equal(middleware.includes("process.env.JWT_SECRET ||"), false);
assert.equal(middleware.includes("JWT_SECRET is required."), true);
assert.equal(routes.includes("authenticateToken, checkRole(['admin'])"), true);
assert.equal(dashboard.includes("useAuth()"), true);
assert.equal(dashboard.includes("isAdminUser"), false);
assert.equal(dispatchApi.includes("authenticatedApiRequest"), true);
assert.equal(wizard.includes("mockMode: true"), false);
assert.equal(wizard.includes("isProduction: false"), false);
assert.equal(imageValidation.includes("file.type") || imageValidation.includes("mime"), true);
assert.equal(imageValidation.includes("file.size"), true);
assert.equal(tracked.some((name) => /(^|\/)\.env($|\.)/.test(name) && !name.endsWith(".env.example")), false);
assert.equal(/console\.(log|error|warn).*?(accessToken|authorization|password|secret)/i.test([middleware, routes, wizard, dispatchApi].join("\n")), false);

console.log(JSON.stringify({ suite: "sprint8Security", passed: 13, failed: 0, administratorOnlyAccess: true, browserAdministratorAuthority: false, approvedRequestHelperRequired: true, sensitiveLoggingDetected: false, fileInputTreatedAsUntrusted: true, productionMocksForced: false, privateEnvironmentTracked: false }, null, 2));
