import express from "express";
import { authenticateToken, checkRole } from "../middleware/authMiddleware.js";
import {
  approveVehicle,
  getAdminStats,
  getAllBookings,
  getAllCars,
  getAllUsers,
  getPendingApprovals,
  rejectVehicle,
  updateBookingStatus,
} from "../controllers/adminController.js";

const router = express.Router();
const adminOnly = [authenticateToken, checkRole(["admin"])];

router.get("/stats", ...adminOnly, getAdminStats);
router.get("/users", ...adminOnly, getAllUsers);
router.get("/bookings", ...adminOnly, getAllBookings);
router.put("/bookings/:id/status", ...adminOnly, updateBookingStatus);
router.get("/cars", ...adminOnly, getAllCars);
router.get("/listings/pending", ...adminOnly, getPendingApprovals);
router.patch("/listings/:id/approve", ...adminOnly, approveVehicle);
router.patch("/listings/:id/reject", ...adminOnly, rejectVehicle);

export default router;
