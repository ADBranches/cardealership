export const EXCHANGE_RATE_PROVIDER_STATES = Object.freeze({ READY: 'ready', UNAVAILABLE: 'unavailable', TIMEOUT: 'timeout', MALFORMED_RESPONSE: 'malformed_response' });
export const EXCHANGE_RATE_REFRESH_STATES = Object.freeze({ FRESH: 'fresh', STALE: 'stale', REFRESHING: 'refreshing', FALLBACK: 'fallback', UNAVAILABLE: 'unavailable' });
export const EXCHANGE_RATE_SOURCES = Object.freeze({ MOCK_PROVIDER: 'mock_provider', REFERENCE_PROVIDER: 'reference_provider', DATABASE_CACHE: 'database_cache' });
export const EXCHANGE_RATE_ERROR_CODES = Object.freeze({
  PROVIDER_UNAVAILABLE: 'EXCHANGE_RATE_PROVIDER_UNAVAILABLE',
  PROVIDER_TIMEOUT: 'EXCHANGE_RATE_PROVIDER_TIMEOUT',
  PROVIDER_RATE_LIMITED: 'EXCHANGE_RATE_PROVIDER_RATE_LIMITED',
  MALFORMED_RESPONSE: 'EXCHANGE_RATE_MALFORMED_RESPONSE',
  INVALID_BASE_CURRENCY: 'EXCHANGE_RATE_INVALID_BASE_CURRENCY',
  INVALID_RATE: 'EXCHANGE_RATE_INVALID_RATE',
  CACHE_UNAVAILABLE: 'EXCHANGE_RATE_CACHE_UNAVAILABLE',
});

export function createNormalizedExchangeRateRecord({ baseCurrency, rates, provider, retrievedAt, observedAt, expiresAt }) {
  return Object.freeze({ baseCurrency, rates: Object.freeze({ ...rates }), provider, retrievedAt: new Date(retrievedAt), observedAt: new Date(observedAt ?? retrievedAt), expiresAt: new Date(expiresAt) });
}

export function assertExchangeRateProvider(provider) {
  if (!provider || typeof provider.fetchRates !== 'function') throw new TypeError('Exchange-rate provider must implement fetchRates(baseCurrency).');
  return provider;
}
