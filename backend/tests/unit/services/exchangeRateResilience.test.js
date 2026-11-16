import test from 'node:test';
import assert from 'node:assert/strict';
import { createExchangeRateService } from '../../../services/exchangeRates/exchangeRateService.js';
import { EXCHANGE_RATE_ERROR_CODES as codes } from '../../../contracts/exchangeRate.contract.js';

const start = Date.parse('2026-09-18T10:00:00Z');
const config = { provider: 'frankfurter', supportedCurrencies: ['UGX', 'USD'], cacheTtlMs: 1000, maxStaleMs: 2000, maxObservationAgeMs: 604_800_000, retryBackoffMs: 1000 };
const data = (time = start) => ({ provider: 'frankfurter', baseCurrency: 'UGX', rates: { UGX: 1, USD: 0.00027 }, retrievedAt: new Date(time), observedAt: new Date(time - 1000), expiresAt: new Date(time + 1000) });
function setup({ cached = null, fetchRates = async () => data(), overrides = {} } = {}) {
  let time = start, calls = 0, saved = 0;
  const service = createExchangeRateService({ config: { ...config, ...overrides }, now: () => new Date(time), provider: { async fetchRates() { calls++; return fetchRates(time); } }, repository: {
    async findLatestUsableSnapshot() { return cached; }, async findLatestSnapshot() { return cached; }, async saveFreshSnapshot(value) { saved++; cached = value; return value; },
  } });
  return { service, advance: ms => { time += ms; }, calls: () => calls, saved: () => saved };
}

test('concurrent refresh requests coalesce and persist once', async () => {
  const f = setup();
  const results = await Promise.all(Array.from({ length: 20 }, () => f.service.getRates()));
  assert.equal(f.calls(), 1);
  assert.equal(f.saved(), 1);
  assert.ok(results.every(result => result.source === 'reference_provider'));
  assert.equal((await f.service.getRates()).source, 'database_cache');
});

test('failed refresh backs off and serves only bounded stale cache', async () => {
  const f = setup({ cached: data(start - 1500), fetchRates: async () => { throw new Error('offline'); } });
  assert.equal((await f.service.getRates()).state, 'fallback');
  assert.equal((await f.service.refreshRates()).state, 'fallback');
  assert.equal(f.calls(), 1);
  f.advance(2000);
  await assert.rejects(f.service.getRates(), { code: codes.CACHE_UNAVAILABLE });
  assert.equal(f.calls(), 2);
});

test('rate limit backs off for at least five minutes even without a cache', async () => {
  const f = setup({ fetchRates: async () => { throw Object.assign(new Error('limited'), { code: codes.PROVIDER_RATE_LIMITED }); } });
  await assert.rejects(f.service.getRates(), { code: codes.CACHE_UNAVAILABLE });
  f.advance(299_999);
  await assert.rejects(f.service.refreshRates(), { code: codes.CACHE_UNAVAILABLE });
  await assert.rejects(f.service.getRates('USD'), { code: codes.CACHE_UNAVAILABLE });
  assert.equal(f.calls(), 1);
  f.advance(1);
  await assert.rejects(f.service.getRates(), { code: codes.CACHE_UNAVAILABLE });
  assert.equal(f.calls(), 2);
});

test('stale observation, mock provenance, missing observation, future retrieval and wrong currencies fail closed', async () => {
  for (const invalid of [{ ...data(), observedAt: new Date(start - config.maxObservationAgeMs - 1) }, { ...data(), provider: 'mock' }, { ...data(), observedAt: undefined }, data(start + 1000), { ...data(), rates: { UGX: 1, EUR: 1 } }]) {
    const f = setup({ cached: invalid, fetchRates: async () => invalid });
    await assert.rejects(f.service.getRates(), { code: codes.CACHE_UNAVAILABLE });
    assert.equal(f.saved(), 0);
  }
});

test('disabled service never contacts provider or persists data', async () => {
  const f = setup({ overrides: { provider: 'disabled' } });
  await assert.rejects(f.service.getRates(), { code: codes.CACHE_UNAVAILABLE });
  await assert.rejects(f.service.refreshRates(), { code: codes.CACHE_UNAVAILABLE });
  assert.equal(f.calls(), 0);
});
