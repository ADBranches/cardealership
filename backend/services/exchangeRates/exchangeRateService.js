"use strict";

const configuration = require("../../config/exchangeRates");
const defaultRepository = require("../../repositories/exchangeRateRepository");
const { createMockExchangeRateProvider } = require("./mockExchangeRateProvider");
const { normalizeExchangeRates } = require("./normalizeExchangeRates");
const { EXCHANGE_RATE_REFRESH_STATES, EXCHANGE_RATE_SOURCES, EXCHANGE_RATE_ERROR_CODES } = require("../../contracts/exchangeRate.contract");

const createExchangeRateService = (options = {}) => {
  const provider = options.provider || createMockExchangeRateProvider();
  const repository = options.repository || defaultRepository;
  const now = typeof options.now === "function" ? options.now : () => new Date();
  const cacheTtlMs = options.cacheTtlMs || configuration.cacheTtlMs;

  const getRates = async (baseCurrency = configuration.baseCurrency, forceRefresh = false) => {
    const currentTime = now();

    if (!forceRefresh) {
      const freshSnapshot = await repository.findLatestUsableSnapshot(baseCurrency, currentTime);

      if (freshSnapshot) {
        return Object.freeze({
          state: EXCHANGE_RATE_REFRESH_STATES.FRESH,
          source: EXCHANGE_RATE_SOURCES.DATABASE_CACHE,
          snapshot: freshSnapshot
        });
      }
    }

    try {
      const providerResponse = await provider.fetchRates(baseCurrency);
      const normalizedSnapshot = normalizeExchangeRates(providerResponse, { cacheTtlMs });
      const savedSnapshot = await repository.saveFreshSnapshot(normalizedSnapshot);

      return Object.freeze({
        state: EXCHANGE_RATE_REFRESH_STATES.FRESH,
        source: EXCHANGE_RATE_SOURCES.MOCK_PROVIDER,
        snapshot: savedSnapshot
      });
    } catch (providerError) {
      const fallbackSnapshot = await repository.findLatestSnapshot(baseCurrency);

      if (fallbackSnapshot) {
        return Object.freeze({
          state: EXCHANGE_RATE_REFRESH_STATES.FALLBACK,
          source: EXCHANGE_RATE_SOURCES.DATABASE_CACHE,
          snapshot: fallbackSnapshot,
          providerErrorCode: providerError.code || EXCHANGE_RATE_ERROR_CODES.PROVIDER_UNAVAILABLE
        });
      }

      const unavailableError = new Error("Exchange rates are unavailable from both provider and cache.");
      unavailableError.code = EXCHANGE_RATE_ERROR_CODES.CACHE_UNAVAILABLE;
      unavailableError.cause = providerError;
      throw unavailableError;
    }
  };

  const refreshRates = async (baseCurrency = configuration.baseCurrency) => getRates(baseCurrency, true);

  return Object.freeze({
    getRates,
    refreshRates
  });
};

module.exports = Object.freeze({
  createExchangeRateService
});
