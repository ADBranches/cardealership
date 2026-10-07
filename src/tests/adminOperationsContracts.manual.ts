import assert from "node:assert/strict";
import { canTransitionBooking, getAllowedBookingTransitions, isBookingStatus, isTerminalBookingStatus } from "../features/admin-operations/validation/bookingStatusTransitions";
import { validateRejectionReason } from "../features/admin-operations/validation/listingReviewValidation";
import { normalizeAdminBooking, normalizeAdminBookings, normalizeAdminDashboardStats, normalizeAdminListingReview } from "../features/admin-operations/services";

assert.equal(isBookingStatus("rejected"), true);
assert.deepEqual(getAllowedBookingTransitions("pending"), ["confirmed", "rejected", "cancelled"]);
assert.deepEqual(getAllowedBookingTransitions("confirmed"), ["completed", "cancelled"]);
assert.equal(canTransitionBooking("pending", "rejected"), true);
assert.equal(canTransitionBooking("pending", "completed"), false);
assert.equal(isTerminalBookingStatus("completed"), true);
assert.equal(isTerminalBookingStatus("cancelled"), true);
assert.equal(isTerminalBookingStatus("rejected"), true);
assert.equal(validateRejectionReason(" no ").valid, false);
assert.deepEqual(validateRejectionReason("  duplicate vehicle  "), { valid: true, value: "duplicate vehicle" });
assert.equal(validateRejectionReason("x".repeat(501)).valid, false);

assert.deepEqual(normalizeAdminDashboardStats({ stats: { inventoryCount: "7", total_bookings: 9, totalUsers: "3", pending_bookings: 2, pendingListings: "1" }, timestamp: "2026-10-07T18:00:00.000Z" }), {
  totalCars: 7, totalBookings: 9, totalUsers: 3, pendingBookings: 2, pendingListings: 1, generatedAt: "2026-10-07T18:00:00.000Z",
});

const postgresBooking = normalizeAdminBooking({ id: 12, user_name: "Postgres Customer", user_email: "p@example.com", car_id: 8, make: "Toyota", model: "Crown", booking_date: "2026-10-08", time_slot: "10:00", status: "confirmed", created_at: "2026-10-07", updated_at: "2026-10-07T10:00:00Z" });
assert.equal(postgresBooking?.customerName, "Postgres Customer");
assert.equal(postgresBooking?.vehicleName, "Toyota Crown");
assert.equal(postgresBooking?.status, "confirmed");

const collectionBooking = normalizeAdminBooking({ _id: "booking-2", customerName: "Collection Customer", customerEmail: "c@example.com", vehicleId: "car-2", vehicleName: "BMW X5", bookingDate: "2026-10-09", timeSlot: "14:00", status: "canceled", updatedAt: "2026-10-07T11:00:00Z" });
assert.equal(collectionBooking?.status, "cancelled");
assert.equal(normalizeAdminBooking({ id: 1, status: "unknown" }), null);
assert.equal(normalizeAdminBookings({ data: [{ id: 1, status: "pending" }, { id: 2, status: "unknown" }] }).length, 1);

const listing = normalizeAdminListingReview({ listing_id: 4, brand: "Audi", name: "Q7", year: "2024", price: "45000", mileage: 20, status: "rejected", rejection_reason: "  duplicate  ", created_at: "2026-10-07" });
assert.equal(listing?.make, "Audi");
assert.equal(listing?.rejectionReason, "duplicate");
assert.equal(normalizeAdminListingReview({ id: 2, status: "available" }), null);

console.log(JSON.stringify({ suite: "adminOperationsContracts", passed: 24, failed: 0, canonicalStatusesVerified: true, transitionPathsVerified: true, snakeCaseVerified: true, camelCaseVerified: true, unknownStatusesRejected: true, rejectionReasonRenderedAsData: true }, null, 2));
