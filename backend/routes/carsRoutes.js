import express from "express";

import { validateCarPayload } from "../middleware/validateCarPayload.js";
import {
  fetchCars,
  fetchCarById,
  addCar,
} from "../controllers/carsController.js";

import { uploadCarImage } from "../controllers/carImageController.js";

import { uploadSingleCarImage } from "../middleware/uploadMiddleware.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", fetchCars);
router.get("/:id", fetchCarById);

router.post("/", protect, adminOnly, addCar);

router.post(
  "/upload",
  protect,
  adminOnly,
  uploadSingleCarImage,
  uploadCarImage,
);
// CREATE car
// TODO: Add requireAuth and requireAdmin before validateCarPayload once the
// backend auth middleware exports are finalized by the backend owner.
// Expected final order:
// router.post("/", requireAuth, requireAdmin, validateCarPayload, addCar);
router.post("/", validateCarPayload, addCar);

export default router;

// POST /api/cars/upload is intentionally not wired here yet.
// It should be connected only after the image upload endpoint and ownership are approved.
