import express from "express";
import { validateCarPayload } from "../middleware/validateCarPayload.js";
import {
  fetchCars,
  fetchCarById,
  addCar
} from "../controllers/carsController.js";

const router = express.Router();

// GET all cars
router.get("/", fetchCars);

// GET single car
router.get("/:id", fetchCarById);

// CREATE car
// TODO: Add requireAuth and requireAdmin before validateCarPayload once the
// backend auth middleware exports are finalized by the backend owner.
// Expected final order:
// router.post("/", requireAuth, requireAdmin, validateCarPayload, addCar);
router.post("/", validateCarPayload, addCar);

export default router;

// POST /api/cars/upload is intentionally not wired here yet.
// It should be connected only after the image upload endpoint and ownership are approved.
