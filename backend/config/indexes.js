"use strict";

const EXCHANGE_RATE_INDEXES = Object.freeze([
  Object.freeze({
    fields: Object.freeze({ baseCurrency: 1, retrievedAt: -1, _id: -1 }),
    options: Object.freeze({ name: "exchange_rate_latest_snapshot" })
  }),
  Object.freeze({
    fields: Object.freeze({ expiresAt: 1 }),
    options: Object.freeze({ name: "exchange_rate_expiry_lookup" })
  })
]);

module.exports = Object.freeze({
  EXCHANGE_RATE_INDEXES
});
