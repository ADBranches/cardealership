import configuration from '../../config/exchangeRates.js';
import { EXCHANGE_RATE_ERROR_CODES as codes, EXCHANGE_RATE_REFRESH_STATES as states, EXCHANGE_RATE_SOURCES as sources, assertExchangeRateProvider } from '../../contracts/exchangeRate.contract.js';
import { exchangeRateRepository } from '../../repositories/exchangeRateRepository.js';
import { createMockExchangeRateProvider } from './mockExchangeRateProvider.js';
import { createFrankfurterProvider } from './frankfurterProvider.js';
import { normalizeExchangeRates, normalizeCurrency, normalizeRates, parseExchangeRateTimestamp } from './normalizeExchangeRates.js';

const errorWithCode = (code, message) => Object.assign(new Error(message), { code });
const disabledProvider = Object.freeze({ async fetchRates() { throw errorWithCode(codes.PROVIDER_UNAVAILABLE, 'Exchange-rate provider is disabled.'); } });

export function createExchangeRateService(options = {}) {
  const config = { ...configuration, ...options.config };
  const repository = options.repository ?? exchangeRateRepository;
  const now = options.now ?? (() => new Date());
  const cacheTtlMs = options.cacheTtlMs ?? config.cacheTtlMs;
  if (process.env.NODE_ENV === 'production' && config.provider === 'mock') throw new Error('Synthetic exchange rates are prohibited in production.');
  const provider = assertExchangeRateProvider(options.provider ?? (config.provider === 'mock' ? createMockExchangeRateProvider({ now, scenario: config.mockScenario, rates: config.mockRates }) : config.provider === 'frankfurter' ? createFrankfurterProvider({ ...config, now }) : disabledProvider));
  const inFlight = new Map();
  const failures = new Map();
  let rateLimitedUntil = 0;
  if (typeof now !== 'function' || !Number.isSafeInteger(cacheTtlMs) || cacheTtlMs <= 0) throw new TypeError('Invalid exchange-rate service configuration.');
  for (const method of ['findLatestUsableSnapshot', 'findLatestSnapshot', 'saveFreshSnapshot']) {
    if (typeof repository[method] !== 'function') throw new TypeError(`Repository must implement ${method}.`);
  }
  function checkedCurrency(value) {
    let currency;
    try { currency = normalizeCurrency(value); } catch { throw errorWithCode(codes.INVALID_BASE_CURRENCY, 'Unsupported base currency.'); }
    if (!config.supportedCurrencies.includes(currency)) throw errorWithCode(codes.INVALID_BASE_CURRENCY, 'Unsupported base currency.');
    return currency;
  }
  function allowedSnapshot(snapshot, baseCurrency, currentTime, allowStale = false) {
    try {
      if (!snapshot || snapshot.provider !== config.provider || snapshot.baseCurrency !== baseCurrency || (process.env.NODE_ENV === 'production' && snapshot.provider === 'mock')) return false;
      const rates = normalizeRates(snapshot.rates);
      if (rates[baseCurrency] !== 1 || (config.provider === 'frankfurter' && (Object.keys(rates).length !== config.supportedCurrencies.length || !config.supportedCurrencies.every(currency => Object.hasOwn(rates, currency))))) return false;
      const retrieved = parseExchangeRateTimestamp(snapshot.retrievedAt).getTime();
      if (config.provider === 'frankfurter' && snapshot.observedAt == null) return false;
      const observed = parseExchangeRateTimestamp(snapshot.observedAt ?? snapshot.retrievedAt).getTime();
      const expires = parseExchangeRateTimestamp(snapshot.expiresAt).getTime();
      const current = parseExchangeRateTimestamp(currentTime).getTime();
      return observed <= retrieved && retrieved <= current && expires > retrieved && current < observed + config.maxObservationAgeMs && current < expires + (allowStale ? config.maxStaleMs : 0);
    } catch { return false; }
  }
  const disabled = () => config.provider === 'disabled';
  function result(state, source, snapshot, providerErrorCode) {
    const observed = parseExchangeRateTimestamp(snapshot.observedAt ?? snapshot.retrievedAt).getTime();
    const expires = parseExchangeRateTimestamp(snapshot.expiresAt).getTime();
    const usableUntil = new Date(Math.min(observed + config.maxObservationAgeMs, expires + (state === states.FALLBACK ? config.maxStaleMs : 0)));
    return Object.freeze({ state, source, snapshot, usableUntil, ...(providerErrorCode ? { providerErrorCode } : {}) });
  }

  async function fallback(baseCurrency, code) {
    let snapshot;
    try { snapshot = await repository.findLatestSnapshot(baseCurrency); } catch { /* Unavailable cache is handled below. */ }
    if (allowedSnapshot(snapshot, baseCurrency, now(), true)) return result(states.FALLBACK, sources.DATABASE_CACHE, snapshot, code);
    throw errorWithCode(codes.CACHE_UNAVAILABLE, 'Exchange rates are unavailable.');
  }

  async function performRefresh(baseCurrency) {
    if (now().getTime() < rateLimitedUntil) return fallback(baseCurrency, codes.PROVIDER_RATE_LIMITED);
    const previous = failures.get(baseCurrency);
    if (previous && now().getTime() < previous.retryAt) return fallback(baseCurrency, previous.code);
    try {
      const response = await provider.fetchRates(baseCurrency);
      const normalized = normalizeExchangeRates(response, { cacheTtlMs, expectedBaseCurrency: baseCurrency });
      if (!allowedSnapshot(normalized, baseCurrency, now())) throw errorWithCode(codes.MALFORMED_RESPONSE, 'Provider returned invalid or expired rates.');
      const snapshot = await repository.saveFreshSnapshot(normalized);
      if (!allowedSnapshot(snapshot, baseCurrency, now())) throw errorWithCode(codes.MALFORMED_RESPONSE, 'Invalid persisted snapshot.');
      failures.delete(baseCurrency);
      return result(states.FRESH, config.provider === 'frankfurter' ? sources.REFERENCE_PROVIDER : sources.MOCK_PROVIDER, snapshot);
    } catch (error) {
      const code = Object.values(codes).includes(error?.code) ? error.code : codes.PROVIDER_UNAVAILABLE;
      const retryAt = now().getTime() + Math.max(config.retryBackoffMs, code === codes.PROVIDER_RATE_LIMITED ? 300_000 : 0);
      if (code === codes.PROVIDER_RATE_LIMITED) rateLimitedUntil = Math.max(rateLimitedUntil, retryAt);
      failures.set(baseCurrency, { code, retryAt });
      return fallback(baseCurrency, code);
    }
  }

  function refresh(baseCurrency) {
    if (!inFlight.has(baseCurrency)) inFlight.set(baseCurrency, performRefresh(baseCurrency).finally(() => inFlight.delete(baseCurrency)));
    return inFlight.get(baseCurrency);
  }

  async function getRates(baseCurrency = config.baseCurrency) {
    const currency = checkedCurrency(baseCurrency);
    if (disabled()) throw errorWithCode(codes.CACHE_UNAVAILABLE, 'Exchange rates are disabled.');
    let cached;
    try { cached = await repository.findLatestUsableSnapshot(currency, now()); } catch { /* Attempt a controlled refresh. */ }
    if (allowedSnapshot(cached, currency, now())) return result(states.FRESH, sources.DATABASE_CACHE, cached);
    return refresh(currency);
  }

  async function refreshRates(baseCurrency = config.baseCurrency) {
    const currency = checkedCurrency(baseCurrency);
    if (disabled()) throw errorWithCode(codes.CACHE_UNAVAILABLE, 'Exchange rates are disabled.');
    return refresh(currency);
  }

  return Object.freeze({ getRates, refreshRates });
}

export const exchangeRateService = createExchangeRateService();
