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
