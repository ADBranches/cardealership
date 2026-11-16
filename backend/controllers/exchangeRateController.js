import { EXCHANGE_RATE_ERROR_CODES as codes, EXCHANGE_RATE_REFRESH_STATES as states, EXCHANGE_RATE_SOURCES as sources } from '../contracts/exchangeRate.contract.js';
import { normalizeCurrency, normalizeRates, parseExchangeRateTimestamp } from '../services/exchangeRates/normalizeExchangeRates.js';

export function createExchangeRateResponse(result) {
  const { snapshot } = result;
  const baseCurrency = normalizeCurrency(snapshot.baseCurrency);
  const rates = normalizeRates(snapshot.rates);
  const retrievedAt = parseExchangeRateTimestamp(snapshot.retrievedAt);
  const observedAt = parseExchangeRateTimestamp(snapshot.observedAt ?? (snapshot.provider === 'mock' ? retrievedAt : null));
  const expiresAt = parseExchangeRateTimestamp(snapshot.expiresAt);
  // Injection fixtures without a service deadline get no extra stale window.
  const usableUntil = parseExchangeRateTimestamp(result.usableUntil ?? expiresAt);
  if (usableUntil <= retrievedAt || usableUntil.getTime() > observedAt.getTime() + 604_800_000 || usableUntil.getTime() > expiresAt.getTime() + (result.state === states.FALLBACK ? 604_800_000 : 0)) throw new TypeError('Invalid exchange-rate usability deadline.');
  const providerSource = snapshot.provider === 'mock' ? sources.MOCK_PROVIDER : sources.REFERENCE_PROVIDER;
  if (!['mock', 'frankfurter'].includes(snapshot.provider) || (process.env.NODE_ENV === 'production' && snapshot.provider === 'mock') || rates[baseCurrency] !== 1 || observedAt > retrievedAt || expiresAt <= retrievedAt || ![states.FRESH, states.FALLBACK].includes(result.state) || ![sources.DATABASE_CACHE, providerSource].includes(result.source) || (result.state === states.FALLBACK && result.source !== sources.DATABASE_CACHE)) throw new TypeError('Invalid exchange-rate response contract.');
  const response = {
    success: true, source: result.source, freshness: result.state,
    baseCurrency, rates, provider: snapshot.provider,
    retrievedAt: retrievedAt.toISOString(), observedAt: observedAt.toISOString(), expiresAt: expiresAt.toISOString(), usableUntil: usableUntil.toISOString(),
  };
  if (result.state === states.FALLBACK) response.warning = { code: Object.values(codes).includes(result.providerErrorCode) ? result.providerErrorCode : codes.PROVIDER_UNAVAILABLE, message: 'Cached exchange rates are being returned because the provider is unavailable.' };
  return Object.freeze(response);
}

export function createExchangeRateController(service) {
  if (typeof service?.getRates !== 'function') throw new TypeError('Exchange-rate service must implement getRates.');
  const failure = (response, status, code, message) => response.status(status).json({ success: false, error: { code, message } });
  return Object.freeze({
    async getExchangeRates(request, response) {
      const requested = request.query?.baseCurrency;
      let baseCurrency;
      if (requested !== undefined) {
        try { baseCurrency = normalizeCurrency(requested); } catch { return failure(response, 400, codes.INVALID_BASE_CURRENCY, 'Unsupported base currency.'); }
      }
      try {
        const result = await service.getRates(baseCurrency);
        return response.status(200).json(createExchangeRateResponse(result));
      } catch (error) {
        if (error?.code === codes.INVALID_BASE_CURRENCY) return failure(response, 400, codes.INVALID_BASE_CURRENCY, 'Unsupported base currency.');
        if (error?.code === codes.CACHE_UNAVAILABLE) return failure(response, 503, codes.CACHE_UNAVAILABLE, 'Exchange rates are temporarily unavailable.');
        return failure(response, 500, 'EXCHANGE_RATE_INTERNAL_ERROR', 'Exchange rates could not be retrieved.');
      }
    },
  });
}
