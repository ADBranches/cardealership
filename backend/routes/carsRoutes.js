import express from "express";

import {
  fetchCars,
  fetchCarById,
  addCar,
} from "../controllers/carsController.js";

import { uploadCarImage } from "../controllers/carImageController.js";

import upload from "../middleware/uploadMiddleware.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", fetchCars);
router.get("/:id", fetchCarById);

router.post("/", protect, adminOnly, addCar);

router.post(
  "/upload",
  protect,
  adminOnly,
  upload.single("image"),
  uploadCarImage
);

export default router;