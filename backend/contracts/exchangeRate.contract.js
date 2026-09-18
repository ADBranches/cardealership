"use strict";

const EXCHANGE_RATE_PROVIDER_STATES = Object.freeze({
  READY: "ready",
  UNAVAILABLE: "unavailable",
  TIMEOUT: "timeout",
  MALFORMED_RESPONSE: "malformed_response"
});

const EXCHANGE_RATE_REFRESH_STATES = Object.freeze({
  FRESH: "fresh",
  STALE: "stale",
  REFRESHING: "refreshing",
  FALLBACK: "fallback",
  UNAVAILABLE: "unavailable"
});

const EXCHANGE_RATE_SOURCES = Object.freeze({
  MOCK_PROVIDER: "mock_provider",
  DATABASE_CACHE: "database_cache"
});

const EXCHANGE_RATE_ERROR_CODES = Object.freeze({
  PROVIDER_UNAVAILABLE: "EXCHANGE_RATE_PROVIDER_UNAVAILABLE",
  PROVIDER_TIMEOUT: "EXCHANGE_RATE_PROVIDER_TIMEOUT",
  MALFORMED_RESPONSE: "EXCHANGE_RATE_MALFORMED_RESPONSE",
  INVALID_BASE_CURRENCY: "EXCHANGE_RATE_INVALID_BASE_CURRENCY",
  INVALID_RATE: "EXCHANGE_RATE_INVALID_RATE",
  CACHE_UNAVAILABLE: "EXCHANGE_RATE_CACHE_UNAVAILABLE"
});

const createNormalizedExchangeRateRecord = ({ baseCurrency, rates, provider, retrievedAt, expiresAt }) => Object.freeze({
  baseCurrency,
  rates: Object.freeze({ ...rates }),
  provider,
  retrievedAt,
  expiresAt
});

const assertExchangeRateProvider = (provider) => {
  if (!provider || typeof provider.fetchRates !== "function") {
    throw new TypeError("Exchange-rate provider must implement fetchRates(baseCurrency).");
  }
  return provider;
};

module.exports = Object.freeze({
  EXCHANGE_RATE_PROVIDER_STATES,
  EXCHANGE_RATE_REFRESH_STATES,
  EXCHANGE_RATE_SOURCES,
  EXCHANGE_RATE_ERROR_CODES,
  createNormalizedExchangeRateRecord,
  assertExchangeRateProvider
});
