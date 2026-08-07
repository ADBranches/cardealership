// backend/scripts/ensureCarSearchIndexes.js

import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

dotenv.config({
  path: path.resolve(__dirname, "..", envFile),
});
const INDEX_TARGETS = [
  { name: "idx_cars_make", column: "brand" },
  { name: "idx_cars_model", column: "name" },
  { name: "idx_cars_price", column: "price" },
];

const INDEX_MAX_RETRIES = Number(process.env.INDEX_DB_MAX_RETRIES || 3);

const INDEX_RETRY_DELAY_MS = Number(
  process.env.INDEX_DB_RETRY_DELAY_MS || 1500,
);

function getClientConfig() {
  const sslMode = (process.env.PGSSLMODE || "").toLowerCase();

  const sslDisabled =
    process.env.DB_SSL === "false" ||
    process.env.PGSSL === "false" ||
    sslMode === "disable";

  return {
    connectionString: process.env.DATABASE_URL,

    ssl: sslDisabled
      ? false
      : {
          rejectUnauthorized: false,
        },

    connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT_MS || 10000),
  };
}

function isTransientConnectionError(error) {
  const message = (error?.message || "").toLowerCase();

  const code = (error?.code || "").toUpperCase();

  return (
    code === "ECONNRESET" ||
    code === "ETIMEDOUT" ||
    code === "EPIPE" ||
    message.includes("connection terminated unexpectedly") ||
    message.includes("terminating connection") ||
    message.includes("socket hang up")
  );
}

function sleep(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function tableExists(client, tableName) {
  const result = await client.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = $1
      ) AS exists
    `,
    [tableName],
  );

  return result.rows[0]?.exists === true;
}

async function columnExists(client, tableName, columnName) {
  const result = await client.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = $1
          AND column_name = $2
      ) AS exists
    `,
    [tableName, columnName],
  );

  return result.rows[0]?.exists === true;
}

async function createIndexIfEligible(client, tableName, indexTarget) {
  const hasColumn = await columnExists(client, tableName, indexTarget.column);

  if (!hasColumn) {
    console.log(
      `[indexing] Skipped ${indexTarget.name}: column '${indexTarget.column}' does not exist on ${tableName}.`,
    );

    return;
  }

  const createIndexSql = `
    CREATE INDEX CONCURRENTLY IF NOT EXISTS
    ${indexTarget.name}
    ON ${tableName} (${indexTarget.column});
  `;

  await client.query(createIndexSql);

  console.log(
    `[indexing] Ensured ${indexTarget.name} on ${tableName}(${indexTarget.column}).`,
  );
}

export async function ensureCarSearchIndexes() {
  if (!process.env.DATABASE_URL) {
    console.log("[indexing] Skipped: DATABASE_URL is not set.");

    return;
  }

  for (let attempt = 1; attempt <= INDEX_MAX_RETRIES; attempt += 1) {
    const client = new Client(getClientConfig());

    try {
      await client.connect();

      console.log(
        `[indexing] Database connection established on attempt ${attempt}.`,
      );

      const hasCarsTable = await tableExists(client, "cars");

      if (!hasCarsTable) {
        console.log("[indexing] Skipped: cars table not found.");

        return;
      }

      for (const indexTarget of INDEX_TARGETS) {
        await createIndexIfEligible(client, "cars", indexTarget);
      }

      console.log("[indexing] Car search indexes are ready.");

      return;
    } catch (error) {
      const transient = isTransientConnectionError(error);

      const canRetry = attempt < INDEX_MAX_RETRIES && transient;

      if (transient && !canRetry) {
        console.warn(
          `[indexing] Skipped: database unavailable after ${INDEX_MAX_RETRIES} attempts (${error.message}).`,
        );

        return;
      }

      if (!canRetry) {
        throw error;
      }

      const waitMilliseconds = INDEX_RETRY_DELAY_MS * attempt;

      console.warn(
        `[indexing] Database connection attempt ${attempt}/${INDEX_MAX_RETRIES} failed (${error.message}). Retrying in ${waitMilliseconds}ms...`,
      );

      await sleep(waitMilliseconds);
    } finally {
      try {
        await client.end();
      } catch {
        // Ignore connection cleanup errors.
      }
    }
  }
}

const scriptWasRunDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (scriptWasRunDirectly) {
  ensureCarSearchIndexes()
    .then(() => {
      console.log("[indexing] Car search index check complete.");
    })
    .catch((error) => {
      console.error(
        "[indexing] Failed to ensure car search indexes:",
        error.message,
      );

      process.exitCode = 1;
    });
}
