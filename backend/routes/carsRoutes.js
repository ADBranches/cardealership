import express from "express";
import {
  fetchCars,
  fetchCarById,
  addCar
} from "../controllers/carsController.js";

import {
  protect,
  adminOnly
} from "../middleware/authMiddleware.js";

const router = express.Router();


// PUBLIC ROUTES
router.get("/", fetchCars);
router.get("/:id", fetchCarById);



router.post(
  "/",
  protect,
  adminOnly,
  addCar
);

export default router;