const { Client } = require("pg");
const dotenv = require("dotenv");
const path = require("path");

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

dotenv.config({ path: envFile });
dotenv.config({ path: path.resolve(__dirname, "..", envFile) });

const INDEX_TARGETS = [
  { name: "idx_cars_make", column: "make" },
  { name: "idx_cars_model", column: "model" },
  { name: "idx_cars_price", column: "price" },
];

async function tableExists(client, tableName) {
  const result = await client.query(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = $1
    ) AS exists`,
    [tableName],
  );

  return result.rows[0]?.exists === true;
}

async function columnExists(client, tableName, columnName) {
  const result = await client.query(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = $2
    ) AS exists`,
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

  const createIndexSql = `CREATE INDEX CONCURRENTLY IF NOT EXISTS ${indexTarget.name} ON ${tableName} (${indexTarget.column});`;
  await client.query(createIndexSql);
  console.log(
    `[indexing] Ensured ${indexTarget.name} on ${tableName}(${indexTarget.column}).`,
  );
}

async function ensureCarSearchIndexes() {
  if (!process.env.DATABASE_URL) {
    console.log("[indexing] Skipped: DATABASE_URL is not set.");
    return;
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    const hasCarsTable = await tableExists(client, "cars");

    if (!hasCarsTable) {
      console.log("[indexing] Skipped: cars table not found.");
      return;
    }

    for (const indexTarget of INDEX_TARGETS) {
      await createIndexIfEligible(client, "cars", indexTarget);
    }
  } finally {
    await client.end();
  }
}

module.exports = {
  ensureCarSearchIndexes,
};

if (require.main === module) {
  ensureCarSearchIndexes()
    .then(() => {
      console.log("[indexing] Car search index check complete.");
      process.exit(0);
    })
    .catch((error) => {
      console.error(
        "[indexing] Failed to ensure car search indexes:",
        error.message,
      );
      process.exit(1);
    });
}
