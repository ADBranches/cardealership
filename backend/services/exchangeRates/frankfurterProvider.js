import configuration from '../../config/exchangeRates.js';
import { EXCHANGE_RATE_ERROR_CODES as codes } from '../../contracts/exchangeRate.contract.js';
import { normalizeCurrency, parseExchangeRateTimestamp } from './normalizeExchangeRates.js';

const fail = (code, message) => Object.assign(new Error(message), { code });
const MAX_BYTES = 65_536;

async function readRows(response) {
  const contentLength = response.headers.get('content-length');
  if ((contentLength && Number(contentLength) > MAX_BYTES) || !response.body) {
    void response.body?.cancel().catch(() => {});
    throw fail(codes.MALFORMED_RESPONSE, 'Invalid response size.');
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let bytes = 0, body = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BYTES) throw fail(codes.MALFORMED_RESPONSE, 'Response exceeds size limit.');
      body += decoder.decode(value, { stream: true });
    }
    return JSON.parse(body + decoder.decode());
  } catch (error) {
    void reader.cancel().catch(() => {});
    if (error?.name === 'AbortError') throw error;
    throw fail(codes.MALFORMED_RESPONSE, 'Invalid reference-rate response.');
  } finally { reader.releaseLock(); }
}

export function createFrankfurterProvider(options = {}) {
  const currencies = [...new Set((options.supportedCurrencies ?? configuration.supportedCurrencies).map(normalizeCurrency))];
  const timeoutMs = options.requestTimeoutMs ?? configuration.requestTimeoutMs;
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const now = options.now ?? (() => new Date());
  if (currencies.length < 2 || currencies.length > 20 || !Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30_000 || typeof fetchImpl !== 'function' || typeof now !== 'function') throw new TypeError('Invalid reference-rate provider configuration.');
  return Object.freeze({
    async fetchRates(requestedBase = configuration.baseCurrency) {
      let base;
      try { base = normalizeCurrency(requestedBase); } catch { throw fail(codes.INVALID_BASE_CURRENCY, 'Unsupported base currency.'); }
      if (!currencies.includes(base)) throw fail(codes.INVALID_BASE_CURRENCY, 'Unsupported base currency.');
      const quotes = currencies.filter(currency => currency !== base);
      const url = new URL('https://api.frankfurter.dev/v2/rates');
      url.searchParams.set('base', base);
      url.searchParams.set('quotes', quotes.join(','));
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetchImpl(url, { signal: controller.signal, redirect: 'error', headers: { Accept: 'application/json' } });
        if (!response.ok) {
          void response.body?.cancel().catch(() => {});
          if (response.status === 429) throw fail(codes.PROVIDER_RATE_LIMITED, 'Reference provider rate limited the request.');
          throw fail(codes.PROVIDER_UNAVAILABLE, 'Reference provider unavailable.');
        }
        const rows = await readRows(response);
        const retrievedAt = parseExchangeRateTimestamp(now());
        if (!Array.isArray(rows) || rows.length !== quotes.length) throw fail(codes.MALFORMED_RESPONSE, 'Incomplete reference-rate response.');
        const rates = { [base]: 1 };
        let observedAt = retrievedAt;
        for (const row of rows) {
          if (!row || row.base !== base || !quotes.includes(row.quote) || Object.hasOwn(rates, row.quote) || typeof row.rate !== 'number' || !Number.isFinite(row.rate) || row.rate <= 0 || typeof row.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)) throw fail(codes.MALFORMED_RESPONSE, 'Invalid reference-rate entry.');
          const date = new Date(`${row.date}T00:00:00.000Z`);
          if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== row.date || date > retrievedAt) throw fail(codes.MALFORMED_RESPONSE, 'Invalid observation date.');
          if (date < observedAt) observedAt = date;
          rates[row.quote] = row.rate;
        }
        return Object.freeze({ provider: 'frankfurter', baseCurrency: base, rates: Object.freeze(rates), retrievedAt: retrievedAt.toISOString(), observedAt: observedAt.toISOString() });
      } catch (error) {
        if (controller.signal.aborted) throw fail(codes.PROVIDER_TIMEOUT, 'Reference provider request timed out.');
        if (Object.values(codes).includes(error?.code)) throw error;
        throw fail(codes.PROVIDER_UNAVAILABLE, 'Reference provider unavailable.');
      } finally { clearTimeout(timer); }
    },
  });
}
