import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

dotenv.config({
  path: path.resolve(__dirname, "..", envFile),
});

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // Local Docker PostgreSQL does not require SSL.
  ssl: isProduction
    ? {
        rejectUnauthorized: false,
      }
    : false,

  connectionTimeoutMillis: 10000,
});

pool.on("error", (error) => {
  console.error("❌ Unexpected PostgreSQL pool error:", error);
});

async function verifyDatabaseConnection() {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database_name, NOW() AS connected_at",
    );

    console.log(
      `✅ Connected to PostgreSQL database: ${result.rows[0].database_name}`,
    );
  } catch (error) {
    console.error("❌ DB connection error:", error.message);
  }
}

verifyDatabaseConnection();

const db = {
  async query(text, params = []) {
    try {
      return await pool.query(text, params);
    } catch (error) {
      console.error("❌ Database query failed:", {
        text,
        message: error.message,
      });

      throw error;
    }
  },

  pool,
};

export default db;
