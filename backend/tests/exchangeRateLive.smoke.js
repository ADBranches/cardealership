// Deliberately opt-in: run only from the isolated Phase 5 verification copy.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { requestRateSnapshot, formatVehiclePrice, usableRate } from '../../src/features/currency/exchangeRates.ts';

assert.equal(process.env.NODE_ENV, 'production');
assert.equal(process.env.EXCHANGE_RATE_PROVIDER, 'frankfurter');
assert.equal(process.env.PORT, '0');
assert.equal(process.env.HOST, '127.0.0.1');
assert.equal(process.env.S16_ISOLATED_SMOKE, 'true');
assert.equal(existsSync(new URL('../data.sqlite', import.meta.url)), false, 'Live smoke must use a fresh isolated SQLite database.');

const { server } = await import('../server.js');
try {
  if (!server.listening) await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  assert.equal(address.address, '127.0.0.1');
  const origin = `http://127.0.0.1:${address.port}`;
  const health = await fetch(`${origin}/api/health`, { signal: AbortSignal.timeout(8000) });
  assert.equal(health.status, 200);
  assert.ok((await health.json()).endpoints.includes('GET  /api/exchange-rates'));
  const fetcher = (path, init) => fetch(`${origin}${path}`, init);
  const first = await requestRateSnapshot(fetcher, AbortSignal.timeout(15000));
  assert.equal(first.provider, 'frankfurter');
  assert.equal(first.freshness, 'fresh');
  for (const currency of ['UGX', 'USD', 'EUR', 'GBP', 'KES']) assert.ok(usableRate(first, currency) > 0, `Missing ${currency} quote.`);
  const second = await requestRateSnapshot(fetcher, AbortSignal.timeout(15000));
  assert.equal(second.source, 'database_cache');
  assert.deepEqual(second.rates, first.rates);
  const { exchangeRateRepository } = await import('../repositories/exchangeRateRepository.js');
  const persisted = await exchangeRateRepository.findLatestSnapshot('UGX');
  assert.equal(persisted.provider, 'frankfurter');
  assert.equal(persisted.rates.USD, first.rates.USD);
  const exampleUGX = 30_000_000;
  const converted = formatVehiclePrice(exampleUGX, 'USD', usableRate(first, 'USD'));
  assert.ok(converted);
  console.log(JSON.stringify({ status: 'PASS', provider: first.provider, source: first.source, observedAt: new Date(first.observedAt).toISOString(), retrievedAt: new Date(first.retrievedAt).toISOString(), cacheSource: second.source, currencies: Object.keys(first.rates), exampleUGX, exampleEstimate: converted }, null, 2));
} finally {
  await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
}
