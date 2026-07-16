// backend/routes/bookingRoutes.js
import express from 'express';
import {
    createBooking,
    getUserBookings,
    getBookingById,
    cancelBooking,
    updateBooking
} from '../controllers/bookingController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes (auth required)
router.use(authenticateToken);
router.post('/create', createBooking);
router.get('/my-bookings', getUserBookings);
router.get('/:id', getBookingById);
router.put('/:id', updateBooking);
router.delete('/:id/cancel', cancelBooking);

export default router;