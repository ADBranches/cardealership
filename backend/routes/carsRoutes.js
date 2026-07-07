import express from "express";
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
router.post("/", addCar);

export default router;