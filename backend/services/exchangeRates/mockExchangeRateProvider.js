import configuration, {
  MOCK_EXCHANGE_RATE_SCENARIOS,
} from "../../config/exchangeRates.js";
import {
  assertExchangeRateProvider,
  EXCHANGE_RATE_ERROR_CODES,
} from "../../contracts/exchangeRate.contract.js";

const createProviderError = (code, message) =>
  Object.assign(new Error(message), { code });

export const createMockExchangeRateProvider = (
  options = {},
) => {
  const scenario =
    options.scenario || configuration.mockScenario;
  const rates = options.rates || configuration.mockRates;
  const now = options.now || (() => new Date());

  return assertExchangeRateProvider(
    Object.freeze({
      async fetchRates(baseCurrency) {
        if (
          scenario ===
          MOCK_EXCHANGE_RATE_SCENARIOS.TIMEOUT
        ) {
          throw createProviderError(
            EXCHANGE_RATE_ERROR_CODES.PROVIDER_TIMEOUT,
            "Mock exchange-rate provider timed out.",
          );
        }

        if (
          scenario ===
          MOCK_EXCHANGE_RATE_SCENARIOS.UNAVAILABLE
        ) {
          throw createProviderError(
            EXCHANGE_RATE_ERROR_CODES.PROVIDER_UNAVAILABLE,
            "Mock exchange-rate provider is unavailable.",
          );
        }

        if (
          scenario ===
          MOCK_EXCHANGE_RATE_SCENARIOS.MALFORMED_RESPONSE
        ) {
          return Object.freeze({
            provider: "mock",
            baseCurrency,
            rates: Object.freeze({ USD: -1 }),
            retrievedAt: "invalid-date",
          });
        }

        if (
          scenario !==
          MOCK_EXCHANGE_RATE_SCENARIOS.SUCCESS
        ) {
          throw createProviderError(
            EXCHANGE_RATE_ERROR_CODES.MALFORMED_RESPONSE,
            "Unsupported mock-provider scenario.",
          );
        }

        return Object.freeze({
          provider: "mock",
          baseCurrency: String(baseCurrency)
            .trim()
            .toUpperCase(),
          rates,
          retrievedAt: now().toISOString(),
        });
      },
    }),
  );
};
