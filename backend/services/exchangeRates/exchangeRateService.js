import configuration from "../../config/exchangeRates.js";
import {
  EXCHANGE_RATE_ERROR_CODES,
  EXCHANGE_RATE_REFRESH_STATES,
  EXCHANGE_RATE_SOURCES,
} from "../../contracts/exchangeRate.contract.js";
import {
  exchangeRateRepository,
} from "../../repositories/exchangeRateRepository.js";
import {
  createMockExchangeRateProvider,
} from "./mockExchangeRateProvider.js";
import {
  normalizeExchangeRates,
} from "./normalizeExchangeRates.js";

export const createExchangeRateService = (
  options = {},
) => {
  const repository =
    options.repository || exchangeRateRepository;
  const provider =
    options.provider || createMockExchangeRateProvider();
  const config = options.config || configuration;
  const now = options.now || (() => new Date());

  const refreshRates = async (
    baseCurrency = config.baseCurrency,
  ) => {
    const providerResponse =
      await provider.fetchRates(baseCurrency);

    const normalized = normalizeExchangeRates(
      providerResponse,
      {
        cacheTtlMs: config.cacheTtlMs,
      },
    );

    const snapshot =
      await repository.saveFreshSnapshot(normalized);

    return Object.freeze({
      state: EXCHANGE_RATE_REFRESH_STATES.FRESH,
      source: EXCHANGE_RATE_SOURCES.MOCK_PROVIDER,
      snapshot,
    });
  };

  const getRates = async (
    baseCurrency = config.baseCurrency,
  ) => {
    const cachedSnapshot =
      await repository.findLatestUsableSnapshot(
        baseCurrency,
        now(),
      );

    if (cachedSnapshot) {
      return Object.freeze({
        state: EXCHANGE_RATE_REFRESH_STATES.FRESH,
        source: EXCHANGE_RATE_SOURCES.DATABASE_CACHE,
        snapshot: cachedSnapshot,
      });
    }

    try {
      return await refreshRates(baseCurrency);
    } catch (providerError) {
      const fallbackSnapshot =
        await repository.findLatestSnapshot(baseCurrency);

      if (fallbackSnapshot) {
        return Object.freeze({
          state: EXCHANGE_RATE_REFRESH_STATES.FALLBACK,
          source: EXCHANGE_RATE_SOURCES.DATABASE_CACHE,
          snapshot: fallbackSnapshot,
          providerErrorCode:
            providerError.code ||
            EXCHANGE_RATE_ERROR_CODES.PROVIDER_UNAVAILABLE,
        });
      }

      throw Object.assign(
        new Error("Exchange rates are unavailable."),
        {
          code:
            EXCHANGE_RATE_ERROR_CODES.CACHE_UNAVAILABLE,
          cause: providerError,
        },
      );
    }
  };

  return Object.freeze({
    getRates,
    refreshRates,
  });
};

export const exchangeRateService =
  createExchangeRateService();
