import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createExchangeRateRouter } from '../../routes/exchangeRateRoutes.js';
import { readFileSync } from 'node:fs';

const snapshot = { provider: 'frankfurter', baseCurrency: 'UGX', rates: { UGX: 1, USD: 0.00027 }, retrievedAt: '2026-09-18T10:00:00Z', observedAt: '2026-09-17T00:00:00Z', expiresAt: '2026-09-18T12:00:00Z' };
const success = { state: 'fresh', source: 'reference_provider', snapshot };
async function serve(t, service, limits) {
  const app = express();
  app.use('/api/exchange-rates', createExchangeRateRouter(service, limits));
  const server = app.listen(0, '127.0.0.1');
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
  return (suffix = '', init) => fetch(`http://127.0.0.1:${server.address().port}/api/exchange-rates${suffix}`, init);
}

test('server mounts exchange-rate router once before 404 and binds its worker after listen', () => {
  const source = readFileSync(new URL('../../server.js', import.meta.url), 'utf8');
  const mount = "app.use('/api/exchange-rates', exchangeRateRoutes);";
  assert.equal(source.split(mount).length, 2);
  assert.ok(source.indexOf(mount) < source.indexOf('res.status(404).json'));
  assert.ok(source.includes('GET  /api/exchange-rates'));
  assert.ok(source.indexOf('attachExchangeRateWorker(server);') > source.indexOf('const server = app.listen('));
});

test('public read-only API returns validated reference data, observation timestamp and safe headers', async t => {
  const request = await serve(t, { getRates: async base => { assert.equal(base, 'UGX'); return success; } });
  const response = await request('?baseCurrency=ugx');
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  const body = await response.json();
  assert.equal(body.observedAt, '2026-09-17T00:00:00.000Z');
  assert.equal(body.provider, 'frankfurter'); assert.equal(body.rates.USD, 0.00027);
  const head = await request('?baseCurrency=UGX', { method: 'HEAD' });
  assert.equal(head.status, 200); assert.equal(await head.text(), '');
});

test('malformed query and disallowed methods never reach the service', async t => {
  let calls = 0;
  const request = await serve(t, { getRates: async () => { calls++; return success; } });
  for (const suffix of ['?baseCurrency=UGX&baseCurrency=USD', '?baseCurrency[x]=USD', '?baseCurrency=UGX/USD', '?provider=mock', '?baseCurrency=' + 'x'.repeat(600)]) {
    assert.equal((await request(suffix)).status, 400);
  }
  const post = await request('', { method: 'POST' });
  assert.equal(post.status, 405); assert.equal(post.headers.get('allow'), 'GET, HEAD');
  assert.equal(calls, 0);
});

test('HTTP rate limit returns 429, retry-after and safe error without trusting spoofed headers', async t => {
  const request = await serve(t, { getRates: async () => success }, { perClient: 2, global: 8 });
  assert.equal((await request()).status, 200);
  assert.equal((await request('', { headers: { 'X-Forwarded-For': '203.0.113.1' } })).status, 200);
  const limited = await request('', { headers: { 'X-Forwarded-For': '203.0.113.2' } });
  assert.equal(limited.status, 429); assert.ok(Number(limited.headers.get('retry-after')) > 0);
  assert.equal((await limited.json()).error.code, 'EXCHANGE_RATE_REQUEST_LIMIT');
});

test('provider failure, invalid provider output and fallback preserve controlled HTTP contracts', async t => {
  let mode = 'unavailable';
  const request = await serve(t, { getRates: async () => {
    if (mode === 'unavailable') throw Object.assign(new Error('sensitive provider failure'), { code: 'EXCHANGE_RATE_CACHE_UNAVAILABLE' });
    if (mode === 'invalid') return { ...success, snapshot: { ...snapshot, observedAt: undefined } };
    return { ...success, source: 'database_cache', state: 'fallback', providerErrorCode: 'sensitive provider failure' };
  } });
  const unavailable = await request(); assert.equal(unavailable.status, 503); assert.doesNotMatch(await unavailable.text(), /sensitive/);
  mode = 'invalid'; const invalid = await request(); assert.equal(invalid.status, 500);
  mode = 'fallback'; const cached = await request(); assert.equal(cached.status, 200);
  assert.equal((await cached.json()).warning.code, 'EXCHANGE_RATE_PROVIDER_UNAVAILABLE');
});
