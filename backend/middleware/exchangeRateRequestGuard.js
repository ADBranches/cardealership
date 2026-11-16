import { performance } from 'node:perf_hooks';

// Fixed-window, process-local limits. Do not trust client-supplied forwarding headers.
export function createExchangeRateRequestGuard({ windowMs = 60_000, perClient = 120, global = 1200, now = () => performance.now() } = {}) {
  if (![windowMs, perClient, global].every(value => Number.isSafeInteger(value) && value > 0) || perClient > global || global > 100_000 || typeof now !== 'function') throw new TypeError('Invalid exchange-rate request limits.');
  let windowStart = now();
  let requests = 0;
  const clients = new Map();
  const fail = (res, status, code, message) => res.status(status).json({ success: false, error: { code, message } });

  return function exchangeRateRequestGuard(req, res, next) {
    res.set('Cache-Control', 'no-store');
    res.set('X-Content-Type-Options', 'nosniff');
    const current = now();
    if (current < windowStart || current - windowStart >= windowMs) {
      windowStart = current;
      requests = 0;
      clients.clear();
    }
    const key = req.ip || req.socket?.remoteAddress || 'unknown';
    const used = clients.get(key) ?? 0;
    if (requests >= global || used >= perClient) {
      res.set('Retry-After', String(Math.max(1, Math.ceil((windowStart + windowMs - current) / 1000))));
      return fail(res, 429, 'EXCHANGE_RATE_REQUEST_LIMIT', 'Too many exchange-rate requests. Please retry later.');
    }
    requests++;
    clients.set(key, used + 1); // Cardinality cannot exceed the global request budget.
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.set('Allow', 'GET, HEAD');
      return fail(res, 405, 'EXCHANGE_RATE_METHOD_NOT_ALLOWED', 'Only GET and HEAD are supported.');
    }
    if ((req.originalUrl ?? '').length > 512 || Object.keys(req.query ?? {}).some(key => key !== 'baseCurrency')) {
      return fail(res, 400, 'EXCHANGE_RATE_INVALID_QUERY', 'Only the baseCurrency query parameter is supported.');
    }
    return next();
  };
}
