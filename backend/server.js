// backend/server.js

import express from "express";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import carsRoutes from "./routes/carsRoutes.js";

import { ensureCarSearchIndexes } from "./scripts/ensureCarSearchIndexes.js";

dotenv.config({
  path:
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development",
});

const app = express();
const PORT = process.env.PORT || 5500;

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
    ],

    credentials: true,
  }),
);

/*
|--------------------------------------------------------------------------
| API RESPONSE COMPRESSION
|--------------------------------------------------------------------------
|
| Compresses supported responses using Gzip or Brotli depending on the
| client's Accept-Encoding header.
|
*/

app.use(
  compression({
    threshold: 1024,
    level: 6,

    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }

      return compression.filter(req, res);
    },
  }),
);

/*
|--------------------------------------------------------------------------
| REQUEST BODY PARSING
|--------------------------------------------------------------------------
*/

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    status: "OK",
    message: "Backend server is running",
    timestamp: new Date().toISOString(),
  });
});

/*
|--------------------------------------------------------------------------
| AUTHENTICATION ROUTES
|--------------------------------------------------------------------------
|
| POST /api/auth/register
| POST /api/auth/login
|
| These routes use the real PostgreSQL-backed authentication controller.
|
*/

app.use("/api/auth", authRoutes);

/*
|--------------------------------------------------------------------------
| ADMIN STATS
|--------------------------------------------------------------------------
*/

app.get("/api/admin/stats", (req, res) => {
  return res.status(200).json({
    success: true,

    stats: {
      totalCars: 6,
      totalUsers: 10,
      totalBookings: 25,
      pendingBookings: 3,
    },
  });
});

/*
|--------------------------------------------------------------------------
| CAR ROUTES
|--------------------------------------------------------------------------
|
| GET  /api/cars
| GET  /api/cars/:id
| POST /api/cars
| POST /api/cars/upload
|
| Upload pipeline:
|
| Multer validation
| → Cloudinary resize and compression
| → WebP conversion
| → PostgreSQL car_images insert
|
*/

app.use("/api/cars", carsRoutes);

/*
|--------------------------------------------------------------------------
| BOOKING ROUTES
|--------------------------------------------------------------------------
*/

app.post("/api/bookings/create", (req, res) => {
  const { car_id, booking_date, time_slot } = req.body;

  console.log("Booking:", car_id, booking_date, time_slot);

  if (!car_id || !booking_date || !time_slot) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  return res.status(201).json({
    success: true,
    message: "Booking created successfully!",

    booking: {
      id: Date.now(),
      car_id,
      booking_date,
      time_slot,
      status: "pending",
    },
  });
});

app.get("/api/bookings/check-availability", (req, res) => {
  return res.status(200).json({
    success: true,
    isAvailable: true,
    message: "This time slot is available!",
  });
});

/*
|--------------------------------------------------------------------------
| 404 HANDLER
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

/*
|--------------------------------------------------------------------------
| GLOBAL ERROR HANDLER
|--------------------------------------------------------------------------
*/

app.use((err, req, res, next) => {
  console.error("Error:", err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(err.status || err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",

    error:
      process.env.NODE_ENV === "development"
        ? {
            name: err.name,
            message: err.message,
            code: err.code || null,
          }
        : undefined,
  });
});

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

const server = app.listen(PORT, () => {
  console.log("========================================");

  console.log(`🚀 Backend Server running on http://localhost:${PORT}`);

  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);

  console.log(`🔐 Authentication: http://localhost:${PORT}/api/auth`);

  console.log(`🚗 Cars API: http://localhost:${PORT}/api/cars`);

  console.log(`🖼️ Image upload: http://localhost:${PORT}/api/cars/upload`);

  console.log("========================================");

  /*
  |--------------------------------------------------------------------------
  | LAZY DATABASE INDEXING
  |--------------------------------------------------------------------------
  |
  | Runs after the HTTP server starts so index checks do not delay startup.
  |
  */

  if (process.env.LAZY_INDEXING_ENABLED !== "false") {
    setImmediate(() => {
      ensureCarSearchIndexes()
        .then(() => {
          console.log("[indexing] Lazy index check completed.");
        })
        .catch((error) => {
          console.error("[indexing] Lazy index setup failed:", error.message);
        });
    });
  } else {
    console.log("[indexing] Lazy indexing is disabled.");
  }
});

/*
|--------------------------------------------------------------------------
| GRACEFUL SHUTDOWN
|--------------------------------------------------------------------------
*/

function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down server...`);

  server.close((error) => {
    if (error) {
      console.error("Server shutdown failed:", error);

      process.exit(1);
    }

    console.log("HTTP server closed successfully.");

    process.exit(0);
  });
}

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});
