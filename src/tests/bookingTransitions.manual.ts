import assert from "node:assert/strict";
import { BOOKING_STATUS_COLUMNS, canTransitionBooking, getAllowedBookingTransitions, isBookingStatus } from "../features/admin-dispatch/validation/bookingTransitions";

assert.deepEqual(BOOKING_STATUS_COLUMNS, ["pending", "confirmed", "completed", "cancelled"]);
assert.equal(isBookingStatus("pending"), true);
assert.equal(isBookingStatus("approved"), false);
assert.deepEqual(getAllowedBookingTransitions("pending"), ["confirmed", "cancelled"]);
assert.deepEqual(getAllowedBookingTransitions("confirmed"), ["completed", "cancelled"]);
assert.deepEqual(getAllowedBookingTransitions("completed"), []);
assert.equal(canTransitionBooking("pending", "confirmed"), true);
assert.equal(canTransitionBooking("pending", "completed"), false);
assert.equal(canTransitionBooking("confirmed", "completed"), true);
assert.equal(canTransitionBooking("completed", "pending"), false);
assert.equal(canTransitionBooking("cancelled", "confirmed"), false);
assert.equal(canTransitionBooking("pending", "pending"), false);
console.log(JSON.stringify({ suite: "bookingTransitions", passed: 12, failed: 0, approvedStatusesOnly: true, unsupportedTransitionsBlocked: true }, null, 2));
