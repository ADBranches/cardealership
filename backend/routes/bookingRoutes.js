// backend/routes/bookingRoutes.js
import express from 'express';
import * as bookingController from '../controllers/bookingController.js';

const router = express.Router();

// Availability (public)
router.get('/check-availability', bookingController.checkAvailability);
router.get('/available-slots/:carId/:date', bookingController.getAvailableSlots);
router.get('/weekly-availability/:carId', bookingController.getWeeklyAvailability);

// Bookings
router.post('/create', bookingController.createBooking);
router.get('/my-bookings', bookingController.getUserBookings);
router.delete('/:id/cancel', bookingController.cancelBooking);

export default router;