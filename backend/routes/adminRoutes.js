// backend/routes/adminRoutes.js
import express from 'express';
import { 
    getAdminStats, 
    getAllBookings, 
    updateBookingStatus,
    getPendingApprovals,
    approveVehicle,
    rejectVehicle
} from '../controllers/adminController.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(isAdmin);

// Dashboard statistics
router.get('/stats', getAdminStats);

// Booking management
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/status', updateBookingStatus);

// Vehicle approval management
router.get('/pending-vehicles', getPendingApprovals);
router.put('/vehicles/:id/approve', approveVehicle);
router.put('/vehicles/:id/reject', rejectVehicle);

export default router;