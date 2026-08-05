import assert from "node:assert/strict";
import { getProtectedRouteDecision, getPublicOnlyRouteDecision, getSafeRedirectPath } from "../app/components/auth/routeAccess";

assert.equal(getProtectedRouteDecision(false, false), "loading");
assert.equal(getProtectedRouteDecision(false, true), "loading");
assert.equal(getProtectedRouteDecision(true, true), "allow");
assert.equal(getProtectedRouteDecision(true, false), "redirect-login");
assert.equal(getPublicOnlyRouteDecision(false, true), "loading");
assert.equal(getPublicOnlyRouteDecision(true, true), "redirect-authenticated");
assert.equal(getPublicOnlyRouteDecision(true, false), "allow");
assert.equal(getSafeRedirectPath("/Admin"), "/Admin");
assert.equal(getSafeRedirectPath("/cars?make=Toyota"), "/cars?make=Toyota");
assert.equal(getSafeRedirectPath("https://malicious.example", "/"), "/");
assert.equal(getSafeRedirectPath("//malicious.example", "/Admin"), "/Admin");
assert.equal(getSafeRedirectPath(null, "/"), "/");

console.log(JSON.stringify({ suite: "protectedRoute", passed: 12, failed: 0, navigationLoop: false, externalRedirectBlocked: true }, null, 2));
