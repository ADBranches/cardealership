"use strict";

const ExchangeRateSnapshot = require("../models/ExchangeRateSnapshot");
const { EXCHANGE_RATE_REFRESH_STATES } = require("../contracts/exchangeRate.contract");

const normalizeCurrency = (currency) => {
  if (typeof currency !== "string" || !/^[A-Za-z]{3}$/.test(currency.trim())) {
    throw new TypeError("Base currency must be a three-letter currency code.");
  }
  return currency.trim().toUpperCase();
};

const normalizeRates = (rates) => {
  if (!rates || typeof rates !== "object" || Array.isArray(rates)) {
    throw new TypeError("Rates must be a non-empty object.");
  }
  const entries = Object.entries(rates);
  if (entries.length === 0) throw new TypeError("Rates must be a non-empty object.");
  const normalizedRates = {};
  for (const [currency, rate] of entries) {
    const normalizedCurrency = normalizeCurrency(currency);
    if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) {
      throw new TypeError(`Rate for ${normalizedCurrency} must be a positive finite number.`);
    }
    normalizedRates[normalizedCurrency] = rate;
  }
  return normalizedRates;
};

const createExchangeRateRepository = (SnapshotModel = ExchangeRateSnapshot) => {
  if (!SnapshotModel || typeof SnapshotModel.create !== "function" || typeof SnapshotModel.findOne !== "function") {
    throw new TypeError("Snapshot model must implement create and findOne.");
  }

  const saveFreshSnapshot = async ({ baseCurrency, rates, provider, retrievedAt, expiresAt }) => {
    const normalizedBaseCurrency = normalizeCurrency(baseCurrency);
    const normalizedRates = normalizeRates(rates);
    const retrievalDate = new Date(retrievedAt);
    const expiryDate = new Date(expiresAt);

    if (!provider || typeof provider !== "string" || !provider.trim()) throw new TypeError("Provider is required.");
    if (Number.isNaN(retrievalDate.getTime())) throw new TypeError("Retrieval time must be valid.");
    if (Number.isNaN(expiryDate.getTime()) || expiryDate.getTime() <= retrievalDate.getTime()) throw new TypeError("Expiry time must be later than retrieval time.");

    return SnapshotModel.create({
      baseCurrency: normalizedBaseCurrency,
      rates: normalizedRates,
      provider: provider.trim(),
      retrievedAt: retrievalDate,
      expiresAt: expiryDate,
      freshnessState: EXCHANGE_RATE_REFRESH_STATES.FRESH
    });
  };

  const findLatestSnapshot = async (baseCurrency) => SnapshotModel.findOne({
    baseCurrency: normalizeCurrency(baseCurrency)
  }).sort({ retrievedAt: -1, _id: -1 }).lean().exec();

  const findLatestUsableSnapshot = async (baseCurrency, currentTime = new Date()) => {
    const comparisonDate = new Date(currentTime);
    if (Number.isNaN(comparisonDate.getTime())) throw new TypeError("Current time must be valid.");
    return SnapshotModel.findOne({
      baseCurrency: normalizeCurrency(baseCurrency),
      expiresAt: { $gt: comparisonDate }
    }).sort({ retrievedAt: -1, _id: -1 }).lean().exec();
  };

  return Object.freeze({
    saveFreshSnapshot,
    findLatestSnapshot,
    findLatestUsableSnapshot
  });
};


const exchangeRateRepository = createExchangeRateRepository();

module.exports = Object.freeze({
  ...exchangeRateRepository,
  createExchangeRateRepository,
  normalizeCurrency,
  normalizeRates
});
