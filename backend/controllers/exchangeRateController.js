import {
  EXCHANGE_RATE_ERROR_CODES,
  EXCHANGE_RATE_REFRESH_STATES,
} from "../contracts/exchangeRate.contract.js";

const ratesToObject = (rates) => {
  if (rates instanceof Map) {
    return Object.fromEntries(rates.entries());
  }

  return { ...rates };
};

export const createExchangeRateController = (service) => {
  if (!service || typeof service.getRates !== "function") {
    throw new TypeError(
      "Exchange-rate service must implement getRates.",
    );
  }

  const getExchangeRates = async (request, response) => {
    try {
      const result = await service.getRates(
        request.query.baseCurrency,
      );
      const snapshot = result.snapshot;

      const body = {
        success: true,
        source: result.source,
        freshness: result.state,
        baseCurrency: snapshot.baseCurrency,
        rates: ratesToObject(snapshot.rates),
        provider: snapshot.provider,
        retrievedAt: new Date(
          snapshot.retrievedAt,
        ).toISOString(),
        expiresAt: new Date(
          snapshot.expiresAt,
        ).toISOString(),
      };

      if (
        result.state ===
        EXCHANGE_RATE_REFRESH_STATES.FALLBACK
      ) {
        body.warning = {
          code: result.providerErrorCode,
          message:
            "Cached exchange rates are being returned because the provider is unavailable.",
        };
      }

      return response.status(200).json(body);
    } catch (error) {
      const statusCode =
        error.code ===
        EXCHANGE_RATE_ERROR_CODES.CACHE_UNAVAILABLE
          ? 503
          : 500;

      return response.status(statusCode).json({
        success: false,
        error: {
          code:
            error.code ||
            "EXCHANGE_RATE_INTERNAL_ERROR",
          message:
            statusCode === 503
              ? "Exchange rates are temporarily unavailable."
              : "Exchange rates could not be retrieved.",
        },
      });
    }
  };

  return Object.freeze({
    getExchangeRates,
  });
};
