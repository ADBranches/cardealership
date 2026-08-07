import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";

dotenv.config({ path: envFile, quiet: true });
dotenv.config({ path: `backend/${envFile}`, quiet: true });

function useDatabaseSsl() {
  if (process.env.DATABASE_SSL !== undefined) {
    return process.env.DATABASE_SSL === "true";
  }

  return process.env.NODE_ENV === "production";
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useDatabaseSsl() ? { rejectUnauthorized: false } : false,
});

pool.on("error", (error) => {
  console.error("Database pool error", {
    code: error.code || "DATABASE_POOL_ERROR",
    message: "An unexpected database connection error occurred.",
  });
});

export async function verifyDatabaseConnection() {
  try {
    const client = await pool.connect();
    client.release();
    return { connected: true };
  } catch (error) {
    return {
      connected: false,
      error: {
        code: error.code || "DATABASE_CONNECTION_FAILED",
        message: "Database connection could not be established.",
      },
    };
  }
}

const db = {
  async query(text, params = []) {
    try {
      return await pool.query(text, params);
    } catch (error) {
      console.error("Database query failed", {
        code: error.code || "DATABASE_QUERY_FAILED",
        message: "A database query could not be completed.",
      });
      throw error;
    }
  },

  pool,
};

export default db;
