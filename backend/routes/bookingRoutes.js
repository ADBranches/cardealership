// backend/routes/bookingRoutes.js
import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Availability (public)
router.get('/check-availability', bookingController.checkAvailability);
router.get('/available-slots/:carId/:date', bookingController.getAvailableSlots);
router.get('/weekly-availability/:carId', bookingController.getWeeklyAvailability);

// Bookings
router.post('/create', protect, bookingController.createBooking);
router.get('/me', protect, bookingController.getUserBookings);
router.get('/my-bookings', protect, bookingController.getUserBookings);
router.delete('/:id/cancel', protect, bookingController.cancelBooking);

export default router;