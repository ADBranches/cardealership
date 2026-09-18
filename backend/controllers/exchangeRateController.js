"use strict";

const { EXCHANGE_RATE_ERROR_CODES, EXCHANGE_RATE_REFRESH_STATES, EXCHANGE_RATE_SOURCES } = require("../contracts/exchangeRate.contract");

const convertRatesToObject = (rates) => {
  if (rates instanceof Map) return Object.fromEntries(rates.entries());
  return { ...rates };
};

const createExchangeRateResponse = (result) => {
  const snapshot = result.snapshot;
  const response = {
    success: true,
    source: result.source,
    freshness: result.state,
    baseCurrency: snapshot.baseCurrency,
    rates: convertRatesToObject(snapshot.rates),
    provider: snapshot.provider,
    retrievedAt: new Date(snapshot.retrievedAt).toISOString(),
    expiresAt: new Date(snapshot.expiresAt).toISOString()
  };

  if (result.state === EXCHANGE_RATE_REFRESH_STATES.FALLBACK) {
    response.warning = {
      code: result.providerErrorCode,
      message: "Cached exchange rates are being returned because the provider is unavailable."
    };
  }

  return Object.freeze(response);
};

const createExchangeRateController = (exchangeRateService) => {
  if (!exchangeRateService || typeof exchangeRateService.getRates !== "function") {
    throw new TypeError("Exchange-rate service must implement getRates.");
  }

  const getExchangeRates = async (request, response) => {
    try {
      const baseCurrency = request.query.baseCurrency;
      const result = await exchangeRateService.getRates(baseCurrency);
      return response.status(200).json(createExchangeRateResponse(result));
    } catch (error) {
      if (error.code === EXCHANGE_RATE_ERROR_CODES.CACHE_UNAVAILABLE) {
        return response.status(503).json({
          success: false,
          error: {
            code: EXCHANGE_RATE_ERROR_CODES.CACHE_UNAVAILABLE,
            message: "Exchange rates are temporarily unavailable."
          }
        });
      }

      return response.status(500).json({
        success: false,
        error: {
          code: error.code || EXCHANGE_RATE_ERROR_CODES.PROVIDER_UNAVAILABLE,
          message: "The exchange-rate request could not be completed."
        }
      });
    }
  };

  return Object.freeze({
    getExchangeRates
  });
};

module.exports = Object.freeze({
  createExchangeRateController,
  createExchangeRateResponse,
  convertRatesToObject,
  EXCHANGE_RATE_REFRESH_STATES,
  EXCHANGE_RATE_SOURCES
});
