import express from "express";
import { confirmTestDriveBooking } from "../controllers/testDriveController.js";

const router = express.Router();

router.post("/", confirmTestDriveBooking);

export default router;
