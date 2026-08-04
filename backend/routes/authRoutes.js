// backend/routes/authRoutes.js

import express from "express";

import { register, login } from "../controllers/authController.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| REGISTER USER
|--------------------------------------------------------------------------
|
| POST /api/auth/register
|
| Saves the new user in the PostgreSQL users table through authController.
|
*/

router.post("/register", register);

/*
|--------------------------------------------------------------------------
| LOGIN USER
|--------------------------------------------------------------------------
|
| POST /api/auth/login
|
| Finds the user in PostgreSQL, verifies the hashed password,
| and returns a signed JWT.
|
*/

router.post("/login", login);

export default router;
