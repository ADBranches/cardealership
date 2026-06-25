import express from "express";
import upload from "../middleware/uploadMiddleware.js";
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


router.post("/test-upload", upload.single("image"), (req, res) => {
  res.json({
    message: "File received successfully",
    file: req.file,
  });
});
export default router;