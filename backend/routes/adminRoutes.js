// backend/routes/adminRoutes.js
import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

router.use(protect, adminOnly);

// Analytics
router.get('/stats', adminController.getAdminStats);

// Pending approvals
router.get('/pending-approvals', adminController.getPendingApprovals);

// Booking management
router.get('/bookings', adminController.getAllBookings);
router.put('/bookings/:id/status', adminController.updateBookingStatus);
router.put('/bookings/bulk', adminController.bulkUpdateBookings);

// Car listing management
router.put('/cars/:id/approve', adminController.approveCar);
router.put('/cars/:id/reject', adminController.rejectCar);
router.put('/cars/:id', adminController.updateCar);
router.delete('/cars/:id', adminController.deleteCar);

export default router;