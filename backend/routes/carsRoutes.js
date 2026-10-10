import express from "express";

import { bulkCarImageController } from "../controllers/bulkCarImageController.js";
import { bulkImageUpload } from "../middleware/bulkImageUpload.js";
import {
  validateCarPayload,
  validateCarUpdatePayload,
} from "../middleware/validateCarPayload.js";

import {
  fetchCars,
  fetchCarById,
  addCar,
  editCar,
  removeCar,
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
| BULK CAR IMAGE UPLOAD
|--------------------------------------------------------------------------
*/

router.post(
  "/:id/images/bulk",
  protect,
  adminOnly,
  bulkImageUpload,
  bulkCarImageController.uploadBulkImages,
);

/*
|--------------------------------------------------------------------------
| UPDATE CAR
|--------------------------------------------------------------------------
|
| Partial updates are supported.
| Only supplied inventory fields are validated and updated.
|
*/

router.patch("/:id", protect, adminOnly, validateCarUpdatePayload, editCar);

/*
|--------------------------------------------------------------------------
| DELETE CAR
|--------------------------------------------------------------------------
*/

router.delete("/:id", protect, adminOnly, removeCar);

/*
|--------------------------------------------------------------------------
| GET SINGLE CAR
|--------------------------------------------------------------------------
*/

router.get("/:id", fetchCarById);

export default router;
