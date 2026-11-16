export const MOCK_EXCHANGE_RATES = Object.freeze({ UGX: 1, USD: 0.00027, EUR: 0.00023, GBP: 0.0002, KES: 0.0348 });
export const MOCK_EXCHANGE_RATE_SCENARIOS = Object.freeze({
  SUCCESS: 'success', TIMEOUT: 'timeout', MALFORMED_RESPONSE: 'malformed_response', UNAVAILABLE: 'unavailable',
});

function positiveInteger(value, fallback, name, maximum = 2_147_483_647) {
  if (value === undefined || value === '') return fallback;
  if (!/^\d+$/.test(String(value)) || !Number.isSafeInteger(Number(value)) || Number(value) <= 0 || Number(value) > maximum) {
    throw new TypeError(`${name} must be a positive integer.`);
  }
  return Number(value);
}

export function resolveExchangeRateConfig(environment = process.env) {
  const production = environment.NODE_ENV === 'production';
  const provider = environment.EXCHANGE_RATE_PROVIDER || (production ? 'disabled' : 'mock');
  if (!['mock', 'disabled', 'frankfurter'].includes(provider)) throw new TypeError('Unsupported exchange-rate provider.');
  if (production && provider === 'mock') throw new Error('Synthetic exchange rates are prohibited in production.');
  const baseCurrency = (environment.EXCHANGE_RATE_BASE_CURRENCY || 'UGX').trim().toUpperCase();
  const supportedCurrencies = [...new Set((environment.EXCHANGE_RATE_SUPPORTED_CURRENCIES || 'UGX,USD,EUR,GBP,KES')
    .split(',').map(currency => currency.trim().toUpperCase()))];
  if (supportedCurrencies.length < 2 || supportedCurrencies.length > 20 || supportedCurrencies.some(currency => !/^[A-Z]{3}$/.test(currency)) || !supportedCurrencies.includes(baseCurrency)) {
    throw new TypeError('Exchange-rate currencies must be valid three-letter codes and include the base currency.');
  }
  if (provider === 'mock' && supportedCurrencies.some(currency => !Object.hasOwn(MOCK_EXCHANGE_RATES, currency))) {
    throw new TypeError('Mock provider does not support the configured currency set.');
  }
  const mockScenario = environment.EXCHANGE_RATE_MOCK_SCENARIO || MOCK_EXCHANGE_RATE_SCENARIOS.SUCCESS;
  if (!Object.values(MOCK_EXCHANGE_RATE_SCENARIOS).includes(mockScenario)) throw new TypeError('Invalid synthetic exchange-rate scenario.');
  return Object.freeze({
    provider, baseCurrency, supportedCurrencies: Object.freeze(supportedCurrencies),
    refreshIntervalMs: positiveInteger(environment.EXCHANGE_RATE_REFRESH_INTERVAL_MS, 3_600_000, 'EXCHANGE_RATE_REFRESH_INTERVAL_MS'),
    requestTimeoutMs: positiveInteger(environment.EXCHANGE_RATE_REQUEST_TIMEOUT_MS, 5_000, 'EXCHANGE_RATE_REQUEST_TIMEOUT_MS', 30_000),
    cacheTtlMs: positiveInteger(environment.EXCHANGE_RATE_CACHE_TTL_MS, 7_200_000, 'EXCHANGE_RATE_CACHE_TTL_MS', 86_400_000),
    maxStaleMs: positiveInteger(environment.EXCHANGE_RATE_MAX_STALE_MS, 86_400_000, 'EXCHANGE_RATE_MAX_STALE_MS', 604_800_000),
    maxObservationAgeMs: positiveInteger(environment.EXCHANGE_RATE_MAX_OBSERVATION_AGE_MS, 604_800_000, 'EXCHANGE_RATE_MAX_OBSERVATION_AGE_MS', 604_800_000),
    retryBackoffMs: positiveInteger(environment.EXCHANGE_RATE_RETRY_BACKOFF_MS, 60_000, 'EXCHANGE_RATE_RETRY_BACKOFF_MS', 3_600_000),
    mockScenario, mockRates: MOCK_EXCHANGE_RATES,
  });
}

export const exchangeRateConfig = resolveExchangeRateConfig();
export default exchangeRateConfig;
