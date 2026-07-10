import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import carsRoutes from "./routes/carsRoutes.js";
import testDriveRoutes from "./routes/testDriveRoutes.js";


// // Swagger setup (we will connect later)
// import setupSwagger from "./docs/swagger.js";

dotenv.config();

// -------------------- APP INIT --------------------
const app = express();

// -------------------- PATH SETUP --------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------- CORS CONFIG --------------------
const allowedOrigins = [
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// -------------------- MIDDLEWARE --------------------
app.use(express.json());

// // -------------------- SWAGGER --------------------
// setupSwagger(app);

// -------------------- TEST ROUTE --------------------
app.get("/", (req, res) => {
  res.send("🚗 Car Dealership API is running...");
});

// -------------------- ROUTES --------------------

app.use("/api/cars", carsRoutes);
app.use("/api/test-drives", testDriveRoutes);

// -------------------- SERVER START --------------------
const PORT = process.env.PORT || 5500;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
