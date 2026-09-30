import db from "../config/db.js";

export const normalizeCurrency = (currency) => {
  if (
    typeof currency !== "string" ||
    !/^[A-Za-z]{3}$/.test(currency.trim())
  ) {
    throw new TypeError(
      "Currency must be a three-letter currency code.",
    );
  }

  return currency.trim().toUpperCase();
};

export const normalizeRates = (rates) => {
  if (
    !rates ||
    typeof rates !== "object" ||
    Array.isArray(rates) ||
    Object.keys(rates).length === 0
  ) {
    throw new TypeError("Rates must be a non-empty object.");
  }

  return Object.fromEntries(
    Object.entries(rates).map(([currency, rate]) => {
      const normalizedCurrency =
        normalizeCurrency(currency);

      if (
        typeof rate !== "number" ||
        !Number.isFinite(rate) ||
        rate <= 0
      ) {
        throw new TypeError(
          `Rate for ${normalizedCurrency} must be positive.`,
        );
      }

      return [normalizedCurrency, rate];
    }),
  );
};

const mapRowToSnapshot = (row) => {
  if (!row) return null;

  return Object.freeze({
    id: row.id,
    baseCurrency: row.base_currency,
    rates: Object.freeze({ ...row.rates }),
    provider: row.provider,
    retrievedAt: new Date(row.retrieved_at),
    expiresAt: new Date(row.expires_at),
  });
};

export const ensureExchangeRateSchema = async (
  database = db,
) => {
  await database.query(`
    CREATE TABLE IF NOT EXISTS exchange_rate_snapshots (
      id BIGSERIAL PRIMARY KEY,
      base_currency CHAR(3) NOT NULL,
      rates JSONB NOT NULL,
      provider VARCHAR(80) NOT NULL,
      retrieved_at TIMESTAMPTZ NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT exchange_rate_expiry_after_retrieval
        CHECK (expires_at > retrieved_at)
    );
  `);

  await database.query(`
    CREATE INDEX IF NOT EXISTS
      exchange_rate_latest_snapshot
    ON exchange_rate_snapshots (
      base_currency,
      retrieved_at DESC,
      id DESC
    );
  `);

  await database.query(`
    CREATE INDEX IF NOT EXISTS
      exchange_rate_expiry_lookup
    ON exchange_rate_snapshots (
      base_currency,
      expires_at DESC
    );
  `);
};

export const createExchangeRateRepository = (
  database = db,
) =>
  Object.freeze({
    async saveFreshSnapshot(snapshot) {
      const baseCurrency = normalizeCurrency(
        snapshot.baseCurrency,
      );
      const rates = normalizeRates(snapshot.rates);
      const retrievedAt = new Date(snapshot.retrievedAt);
      const expiresAt = new Date(snapshot.expiresAt);

      if (
        !snapshot.provider ||
        typeof snapshot.provider !== "string"
      ) {
        throw new TypeError("Provider is required.");
      }

      if (
        Number.isNaN(retrievedAt.getTime()) ||
        Number.isNaN(expiresAt.getTime()) ||
        expiresAt <= retrievedAt
      ) {
        throw new TypeError("Snapshot timestamps are invalid.");
      }

      const result = await database.query(
        `
          INSERT INTO exchange_rate_snapshots (
            base_currency,
            rates,
            provider,
            retrieved_at,
            expires_at
          )
          VALUES ($1, $2::jsonb, $3, $4, $5)
          RETURNING
            id,
            base_currency,
            rates,
            provider,
            retrieved_at,
            expires_at
        `,
        [
          baseCurrency,
          JSON.stringify(rates),
          snapshot.provider.trim(),
          retrievedAt,
          expiresAt,
        ],
      );

      return mapRowToSnapshot(result.rows[0]);
    },

    async findLatestSnapshot(baseCurrency) {
      const result = await database.query(
        `
          SELECT
            id,
            base_currency,
            rates,
            provider,
            retrieved_at,
            expires_at
          FROM exchange_rate_snapshots
          WHERE base_currency = $1
          ORDER BY retrieved_at DESC, id DESC
          LIMIT 1
        `,
        [normalizeCurrency(baseCurrency)],
      );

      return mapRowToSnapshot(result.rows[0]);
    },

    async findLatestUsableSnapshot(
      baseCurrency,
      currentTime = new Date(),
    ) {
      const comparisonTime = new Date(currentTime);

      if (Number.isNaN(comparisonTime.getTime())) {
        throw new TypeError("Current time must be valid.");
      }

      const result = await database.query(
        `
          SELECT
            id,
            base_currency,
            rates,
            provider,
            retrieved_at,
            expires_at
          FROM exchange_rate_snapshots
          WHERE
            base_currency = $1
            AND expires_at > $2
          ORDER BY retrieved_at DESC, id DESC
          LIMIT 1
        `,
        [
          normalizeCurrency(baseCurrency),
          comparisonTime,
        ],
      );

      return mapRowToSnapshot(result.rows[0]);
    },
  });

export const exchangeRateRepository =
  createExchangeRateRepository();
