import { Pool } from "pg";
import dotenv from "dotenv";

// load env file based on NODE_ENV
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

dotenv.config({ path: envFile });

let pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect().catch((err) => console.error("❌ DB connection error:", err));

console.log(`✅ Connected to PostgreSQL database (${process.env.NODE_ENV})`);

const db = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params);
      return res;
    } catch (error) {
      console.error("error in query", { text });
      throw error;
    }
  },
};

export default db;
