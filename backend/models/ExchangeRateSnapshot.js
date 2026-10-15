"use strict";

const mongoose = require("mongoose");
const { EXCHANGE_RATE_REFRESH_STATES } = require("../contracts/exchangeRate.contract");

const normalizedCurrencyPattern = /^[A-Z]{3}$/;
const allowedFreshnessStates = Object.freeze(Object.values(EXCHANGE_RATE_REFRESH_STATES));

const validateRateMap = (rateMap) => {
  if (!(rateMap instanceof Map) || rateMap.size === 0) return false;
  for (const [currency, rate] of rateMap.entries()) {
    if (!normalizedCurrencyPattern.test(currency)) return false;
    if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) return false;
  }
  return true;
};

const exchangeRateSnapshotSchema = new mongoose.Schema({
  baseCurrency: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    match: normalizedCurrencyPattern
  },
  rates: {
    type: Map,
    of: Number,
    required: true,
    validate: {
      validator: validateRateMap,
      message: "Rates must contain positive finite values keyed by three-letter currency codes."
    }
  },
  provider: {
    type: String,
    required: true,
    trim: true
  },
  retrievedAt: {
    type: Date,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    validate: {
      validator: function validateExpiry(value) {
        return this.retrievedAt instanceof Date && value instanceof Date && value.getTime() > this.retrievedAt.getTime();
      },
      message: "Expiry time must be later than retrieval time."
    }
  },
  freshnessState: {
    type: String,
    required: true,
    enum: allowedFreshnessStates
  }
}, {
  timestamps: true,
  versionKey: false
});

exchangeRateSnapshotSchema.index({ baseCurrency: 1, retrievedAt: -1, _id: -1 }, { name: "exchange_rate_latest_snapshot" });
exchangeRateSnapshotSchema.index({ expiresAt: 1 }, { name: "exchange_rate_expiry_lookup" });

const ExchangeRateSnapshot = mongoose.models.ExchangeRateSnapshot || mongoose.model("ExchangeRateSnapshot", exchangeRateSnapshotSchema);

module.exports = ExchangeRateSnapshot;
module.exports.exchangeRateSnapshotSchema = exchangeRateSnapshotSchema;
module.exports.validateRateMap = validateRateMap;
