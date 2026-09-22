const parsePositiveInteger = (value, fallback) => {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
};

export const MOCK_EXCHANGE_RATES = Object.freeze({
  UGX: 1,
  USD: 0.00027,
  EUR: 0.00023,
  GBP: 0.0002,
  KES: 0.0348,
});

export const MOCK_EXCHANGE_RATE_SCENARIOS = Object.freeze({
  SUCCESS: "success",
  TIMEOUT: "timeout",
  MALFORMED_RESPONSE: "malformed_response",
  UNAVAILABLE: "unavailable",
});

export const exchangeRateConfig = Object.freeze({
  provider: process.env.EXCHANGE_RATE_PROVIDER || "mock",
  baseCurrency:
    process.env.EXCHANGE_RATE_BASE_CURRENCY || "UGX",
  supportedCurrencies: Object.freeze(
    (
      process.env.EXCHANGE_RATE_SUPPORTED_CURRENCIES ||
      "UGX,USD,EUR,GBP,KES"
    )
      .split(",")
      .map((currency) => currency.trim().toUpperCase())
      .filter(Boolean),
  ),
  refreshIntervalMs: parsePositiveInteger(
    process.env.EXCHANGE_RATE_REFRESH_INTERVAL_MS,
    3600000,
  ),
  requestTimeoutMs: parsePositiveInteger(
    process.env.EXCHANGE_RATE_REQUEST_TIMEOUT_MS,
    5000,
  ),
  cacheTtlMs: parsePositiveInteger(
    process.env.EXCHANGE_RATE_CACHE_TTL_MS,
    7200000,
  ),
  mockScenario:
    process.env.EXCHANGE_RATE_MOCK_SCENARIO ||
    MOCK_EXCHANGE_RATE_SCENARIOS.SUCCESS,
  mockRates: MOCK_EXCHANGE_RATES,
});

export default exchangeRateConfig;
