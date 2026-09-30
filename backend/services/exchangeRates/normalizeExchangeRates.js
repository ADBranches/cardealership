import {
  createNormalizedExchangeRateRecord,
  EXCHANGE_RATE_ERROR_CODES,
} from "../../contracts/exchangeRate.contract.js";
import {
  normalizeCurrency,
  normalizeRates,
} from "../../repositories/exchangeRateRepository.js";

const createNormalizationError = (code, message) =>
  Object.assign(new TypeError(message), { code });

export const normalizeExchangeRates = (
  providerResponse,
  options = {},
) => {
  if (
    !providerResponse ||
    typeof providerResponse !== "object" ||
    Array.isArray(providerResponse)
  ) {
    throw createNormalizationError(
      EXCHANGE_RATE_ERROR_CODES.MALFORMED_RESPONSE,
      "Provider response must be an object.",
    );
  }

  let baseCurrency;
  let rates;

  try {
    baseCurrency = normalizeCurrency(
      providerResponse.baseCurrency,
    );
    rates = normalizeRates(providerResponse.rates);
  } catch (error) {
    throw createNormalizationError(
      EXCHANGE_RATE_ERROR_CODES.MALFORMED_RESPONSE,
      error.message,
    );
  }

  if (rates[baseCurrency] !== 1) {
    throw createNormalizationError(
      EXCHANGE_RATE_ERROR_CODES.INVALID_RATE,
      "Base-currency rate must equal one.",
    );
  }

  const retrievedAt = new Date(
    options.retrievedAt || providerResponse.retrievedAt,
  );
  const cacheTtlMs = Number(options.cacheTtlMs);

  if (Number.isNaN(retrievedAt.getTime())) {
    throw createNormalizationError(
      EXCHANGE_RATE_ERROR_CODES.MALFORMED_RESPONSE,
      "Provider retrieval time is invalid.",
    );
  }

  if (!Number.isFinite(cacheTtlMs) || cacheTtlMs <= 0) {
    throw createNormalizationError(
      EXCHANGE_RATE_ERROR_CODES.INVALID_RATE,
      "Cache lifetime must be positive.",
    );
  }

  return createNormalizedExchangeRateRecord({
    baseCurrency,
    rates,
    provider: providerResponse.provider,
    retrievedAt,
    expiresAt: new Date(
      retrievedAt.getTime() + cacheTtlMs,
    ),
  });
};
