import test from 'node:test';
import assert from 'node:assert/strict';
import { createExchangeRateRequestGuard } from '../../../middleware/exchangeRateRequestGuard.js';

function request(guard, overrides = {}) {
  const result = { status: 200, headers: {}, proceeded: false };
  const res = { set(key, value) { result.headers[key] = value; return this; }, status(value) { result.status = value; return this; }, json(body) { result.body = body; return this; } };
  guard({ method: 'GET', ip: '127.0.0.1', originalUrl: '/api/exchange-rates', query: {}, ...overrides }, res, () => { result.proceeded = true; });
  return result;
}

test('guard applies no-store and nosniff on valid and rejected requests', () => {
  const guard = createExchangeRateRequestGuard();
  for (const method of ['GET', 'HEAD', 'POST']) {
    const result = request(guard, { method });
    assert.equal(result.headers['Cache-Control'], 'no-store');
    assert.equal(result.headers['X-Content-Type-Options'], 'nosniff');
    assert.equal(result.proceeded, method !== 'POST');
    if (method === 'POST') { assert.equal(result.status, 405); assert.equal(result.headers.Allow, 'GET, HEAD'); }
  }
});

test('oversized URLs and unexpected query parameters never reach controller', () => {
  const guard = createExchangeRateRequestGuard();
  for (const overrides of [{ originalUrl: 'x'.repeat(513) }, { query: { provider: 'untrusted' } }]) {
    const result = request(guard, overrides);
    assert.equal(result.status, 400); assert.equal(result.proceeded, false);
  }
});

test('per-client and aggregate budgets reject requests, reset, and ignore spoofed forwarding headers', () => {
  let time = 0;
  const guard = createExchangeRateRequestGuard({ windowMs: 1000, perClient: 2, global: 3, now: () => time });
  assert.ok(request(guard).proceeded);
  assert.ok(request(guard, { headers: { 'x-forwarded-for': '1.2.3.4' } }).proceeded);
  const rejected = request(guard, { headers: { 'x-forwarded-for': '5.6.7.8' } });
  assert.equal(rejected.status, 429); assert.equal(rejected.headers['Retry-After'], '1');
  assert.ok(request(guard, { ip: 'client2' }).proceeded);
  assert.equal(request(guard, { ip: 'client3' }).status, 429);
  time = 1000;
  assert.ok(request(guard).proceeded);
});

test('invalid limiter configuration is rejected at construction', () => {
  for (const options of [{ perClient: 0 }, { windowMs: -1 }, { perClient: 3, global: 2 }, { global: 100_001 }]) assert.throws(() => createExchangeRateRequestGuard(options), TypeError);
});
