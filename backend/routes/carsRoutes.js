import { bulkCarImageController } from "../controllers/bulkCarImageController.js";
import { bulkImageUpload } from "../middleware/bulkImageUpload.js";
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

/*
|--------------------------------------------------------------------------
| CAR INVENTORY ROUTES
|--------------------------------------------------------------------------
*/

router.get("/", fetchCars);

/*
|--------------------------------------------------------------------------
| CAR IMAGE UPLOAD
|--------------------------------------------------------------------------
|
| POST /api/cars/upload
|
| multipart/form-data:
| image      = image file
| carId      = existing car ID
| imageType  = primary or general
|
*/

router.post(
  "/upload",
  protect,
  adminOnly,
  uploadSingleCarImage,
  uploadCarImage,
);

/*
|--------------------------------------------------------------------------
| CREATE CAR
|--------------------------------------------------------------------------
*/

router.post("/", protect, adminOnly, validateCarPayload, addCar);

/*
|--------------------------------------------------------------------------
| GET SINGLE CAR
|--------------------------------------------------------------------------
|
| Keep this dynamic route after specific routes such as /upload.
|
*/

router.get("/:id", fetchCarById);


router.post(
  "/:id/images/bulk",
  protect,
  adminOnly,
  bulkImageUpload,
  bulkCarImageController.uploadBulkImages,
);

export default router;
