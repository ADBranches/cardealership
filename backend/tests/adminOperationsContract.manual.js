import assert from "node:assert/strict";
import { BOOKING_STATUSES, canTransitionBooking, isBookingStatus } from "../utils/bookingTransitions.js";
import { readFileSync } from "node:fs";

assert.deepEqual(BOOKING_STATUSES, ["pending", "confirmed", "completed", "cancelled"]);
assert.equal(canTransitionBooking("pending", "confirmed"), true);
assert.equal(canTransitionBooking("pending", "completed"), false);
assert.equal(canTransitionBooking("confirmed", "completed"), true);
assert.equal(canTransitionBooking("completed", "pending"), false);
assert.equal(isBookingStatus("approved"), false);
const routes = readFileSync("backend/routes/adminRoutes.js", "utf8");
const auth = readFileSync("backend/controllers/authController.js", "utf8");
assert.equal(routes.includes('router.put("/bookings/:id/status"'), true);
assert.equal(routes.includes('checkRole(["admin"])'), true);
assert.equal(routes.includes('../config/database.js'), false);
assert.equal(auth.includes('allowedRoles = ["user", "admin"]'), false);
assert.equal(auth.includes('normalizedRole = "user"'), true);
console.log(JSON.stringify({ suite: "adminOperationsContract", passed: 11, failed: 0, postgresqlAdminRouter: true, publicAdminRegistrationBlocked: true }, null, 2));
