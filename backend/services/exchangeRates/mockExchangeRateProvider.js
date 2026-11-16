import configuration, { MOCK_EXCHANGE_RATE_SCENARIOS as scenarios } from '../../config/exchangeRates.js';
import { EXCHANGE_RATE_ERROR_CODES as codes } from '../../contracts/exchangeRate.contract.js';
import { createExchangeRateProvider } from './exchangeRateProvider.js';
import { normalizeCurrency, normalizeRates, parseExchangeRateTimestamp } from './normalizeExchangeRates.js';

const providerError = (code, message) => Object.assign(new Error(message), { code });

export function createMockExchangeRateProvider(options = {}) {
  if (process.env.NODE_ENV === 'production') throw new Error('Synthetic exchange rates are prohibited in production.');
  const scenario = options.scenario ?? configuration.mockScenario;
  const sourceRates = Object.freeze(normalizeRates(options.rates ?? configuration.mockRates));
  const sourceBase = normalizeCurrency(options.ratesBaseCurrency ?? 'UGX');
  if (sourceRates[sourceBase] !== 1) throw new TypeError('Synthetic source rates must have a unit base rate.');
  const now = options.now ?? (() => new Date());
  if (typeof now !== 'function') throw new TypeError('Provider clock must be a function.');

  return createExchangeRateProvider(Object.freeze({
    async fetchRates(requestedBase = configuration.baseCurrency) {
      if (scenario === scenarios.TIMEOUT) throw providerError(codes.PROVIDER_TIMEOUT, 'Mock exchange-rate provider timed out.');
      if (scenario === scenarios.UNAVAILABLE) throw providerError(codes.PROVIDER_UNAVAILABLE, 'Mock exchange-rate provider is unavailable.');
      if (scenario === scenarios.MALFORMED_RESPONSE) return Object.freeze({ provider: 'mock', baseCurrency: requestedBase, rates: Object.freeze({ USD: -1 }), retrievedAt: 'invalid-date' });
      if (scenario !== scenarios.SUCCESS) throw providerError(codes.MALFORMED_RESPONSE, 'Unsupported mock-provider scenario.');
      let baseCurrency;
      try { baseCurrency = normalizeCurrency(requestedBase); } catch { throw providerError(codes.INVALID_BASE_CURRENCY, 'Unsupported base currency.'); }
      if (!Object.hasOwn(sourceRates, baseCurrency)) throw providerError(codes.INVALID_BASE_CURRENCY, 'Unsupported base currency.');
      const denominator = sourceRates[baseCurrency];
      const rates = normalizeRates(Object.fromEntries(Object.entries(sourceRates).map(([currency, rate]) => [currency, rate / denominator])));
      return Object.freeze({ provider: 'mock', baseCurrency, rates: Object.freeze(rates), retrievedAt: parseExchangeRateTimestamp(now()).toISOString() });
    },
  }));
}
