import assert from "node:assert/strict";
import fs from "node:fs";
import { authenticateToken, protect } from "../../middleware/authMiddleware.js";

const serverSource = fs.readFileSync(new URL("../../server.js", import.meta.url), "utf8");
const routeSource = fs.readFileSync(new URL("../../routes/bookingRoutes.js", import.meta.url), "utf8");
const controllerSource = fs.readFileSync(new URL("../../controllers/bookingController.js", import.meta.url), "utf8");

assert.equal(protect, authenticateToken, "booking protection must use canonical authentication");
assert.equal(serverSource.split("app.use('/api/bookings'").length - 1, 1, "booking router must be mounted once");
assert.ok(!/app\.(get|post|put|patch|delete)\(['\"]\/api\/bookings/.test(serverSource), "inline booking handlers must not remain in server composition");

for (const publicRoute of [
  "router.get('/check-availability', bookingController.checkAvailability)",
  "router.get('/available-slots/:carId/:date', bookingController.getAvailableSlots)",
  "router.get('/weekly-availability/:carId', bookingController.getWeeklyAvailability)",
]) assert.ok(routeSource.includes(publicRoute), `public booking route changed: ${publicRoute}`);

for (const protectedRoute of [
  "router.post('/create', protect, bookingController.createBooking)",
  "router.get('/me', protect, bookingController.getUserBookings)",
  "router.get('/my-bookings', protect, bookingController.getUserBookings)",
  "router.delete('/:id/cancel', protect, bookingController.cancelBooking)",
]) assert.ok(routeSource.includes(protectedRoute), `protected booking route missing: ${protectedRoute}`);

assert.ok(!controllerSource.includes("req.user?.id || 1"), "booking identity must never fall back to another user");
assert.equal((controllerSource.match(/const user_id = req\.user\.id;/g) || []).length, 3, "all customer booking operations must use authenticated identity");
console.log("BOOKING_ROUTE_CONTRACT_TEST=PASS");
