"use strict";

const configuration = require("../../config/exchangeRates");
const { EXCHANGE_RATE_ERROR_CODES } = require("../../contracts/exchangeRate.contract");
const { createExchangeRateProvider } = require("./exchangeRateProvider");

const createProviderError = (code, message) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

const createMockExchangeRateProvider = (options = {}) => {
  const scenario = options.scenario || configuration.mockScenario;
  const rates = Object.freeze({ ...(options.rates || configuration.mockRates) });
  const now = typeof options.now === "function" ? options.now : () => new Date();

  const fetchRates = async (baseCurrency = configuration.baseCurrency) => {
    if (scenario === configuration.MOCK_EXCHANGE_RATE_SCENARIOS.TIMEOUT) {
      throw createProviderError(EXCHANGE_RATE_ERROR_CODES.PROVIDER_TIMEOUT, "Mock exchange-rate provider timed out.");
    }

    if (scenario === configuration.MOCK_EXCHANGE_RATE_SCENARIOS.UNAVAILABLE) {
      throw createProviderError(EXCHANGE_RATE_ERROR_CODES.PROVIDER_UNAVAILABLE, "Mock exchange-rate provider is unavailable.");
    }

    if (scenario === configuration.MOCK_EXCHANGE_RATE_SCENARIOS.MALFORMED_RESPONSE) {
      return Object.freeze({ provider: "mock", baseCurrency, rates: Object.freeze({ USD: -1 }), retrievedAt: "invalid-date" });
    }

    if (scenario !== configuration.MOCK_EXCHANGE_RATE_SCENARIOS.SUCCESS) {
      throw createProviderError(EXCHANGE_RATE_ERROR_CODES.MALFORMED_RESPONSE, "Unsupported mock-provider scenario.");
    }

    return Object.freeze({
      provider: "mock",
      baseCurrency: String(baseCurrency).trim().toUpperCase(),
      rates,
      retrievedAt: now().toISOString()
    });
  };

  return createExchangeRateProvider(Object.freeze({ fetchRates }));
};

module.exports = Object.freeze({
  createMockExchangeRateProvider
});
