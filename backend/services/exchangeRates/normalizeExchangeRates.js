import { createNormalizedExchangeRateRecord, EXCHANGE_RATE_ERROR_CODES as codes } from '../../contracts/exchangeRate.contract.js';

const normalizationError = (code, message) => Object.assign(new TypeError(message), { code });

export function normalizeCurrency(currency) {
  if (typeof currency !== 'string' || !/^[A-Za-z]{3}$/.test(currency.trim())) throw new TypeError('Currency must be a three-letter currency code.');
  return currency.trim().toUpperCase();
}

export function normalizeRates(rates) {
  const validObject = rates && typeof rates === 'object' && [Object.prototype, null].includes(Object.getPrototypeOf(rates));
  if (!(rates instanceof Map) && !validObject) throw new TypeError('Rates must be a non-empty plain object or map.');
  const entries = rates instanceof Map ? [...rates.entries()] : Object.entries(rates);
  if (!entries.length) throw new TypeError('Rates must not be empty.');
  const normalized = {};
  for (const [currency, rate] of entries) {
    const key = normalizeCurrency(currency);
    if (Object.hasOwn(normalized, key)) throw new TypeError(`Duplicate currency ${key}.`);
    if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) throw new TypeError(`Rate for ${key} must be a positive finite number.`);
    normalized[key] = rate;
  }
  return normalized;
}

export function parseExchangeRateTimestamp(value) {
  if (!(value instanceof Date) && (typeof value !== 'string' || !value.trim())) throw new TypeError('Timestamp must be a valid date.');
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) throw new TypeError('Timestamp must be a valid date.');
  return date;
}

export function normalizeExchangeRates(response, options = {}) {
  if (!response || typeof response !== 'object' || Array.isArray(response)) throw normalizationError(codes.MALFORMED_RESPONSE, 'Provider response must be an object.');
  let baseCurrency, rates, retrievedAt, observedAt;
  try {
    baseCurrency = normalizeCurrency(response.baseCurrency);
    rates = normalizeRates(response.rates);
    retrievedAt = parseExchangeRateTimestamp(options.retrievedAt ?? response.retrievedAt);
    if (response.provider === 'frankfurter' && response.observedAt == null) throw new TypeError('Reference-rate observation date is required.');
    observedAt = parseExchangeRateTimestamp(response.observedAt ?? retrievedAt);
    if (observedAt > retrievedAt) throw new TypeError('Observation time cannot follow retrieval time.');
    if (typeof response.provider !== 'string' || !response.provider.trim() || response.provider.trim().length > 80) throw new TypeError('Provider is required.');
  } catch (error) {
    throw normalizationError(codes.MALFORMED_RESPONSE, error.message);
  }
  if (options.expectedBaseCurrency !== undefined && baseCurrency !== normalizeCurrency(options.expectedBaseCurrency)) {
    throw normalizationError(codes.INVALID_BASE_CURRENCY, 'Provider returned the wrong base currency.');
  }
  if (rates[baseCurrency] !== 1) throw normalizationError(codes.INVALID_RATE, 'Base-currency rate must equal one.');
  const ttl = options.cacheTtlMs;
  if (!Number.isSafeInteger(ttl) || ttl <= 0) throw normalizationError(codes.INVALID_RATE, 'Cache lifetime must be a positive integer.');
  const expiresAt = new Date(retrievedAt.getTime() + ttl);
  if (!Number.isFinite(expiresAt.getTime())) throw normalizationError(codes.INVALID_RATE, 'Cache expiry is invalid.');
  return createNormalizedExchangeRateRecord({ baseCurrency, rates, provider: response.provider.trim(), retrievedAt, observedAt, expiresAt });
}
