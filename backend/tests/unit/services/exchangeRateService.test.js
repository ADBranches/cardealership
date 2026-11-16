import test from 'node:test';
import assert from 'node:assert/strict';
import { createExchangeRateService } from '../../../services/exchangeRates/exchangeRateService.js';

const fixedNow = () => new Date("2026-09-18T10:00:00.000Z");

test("fresh cache suppresses provider calls", async () => {
  let providerCalls = 0;
  const cachedSnapshot = { baseCurrency: 'UGX', provider: 'mock', rates: { UGX: 1, USD: 0.00027 }, retrievedAt: fixedNow(), expiresAt: new Date(fixedNow().getTime() + 1000) };
  const service = createExchangeRateService({
    now: fixedNow,
    provider: { fetchRates: async () => { providerCalls += 1; } },
    repository: {
      findLatestUsableSnapshot: async () => cachedSnapshot,
      findLatestSnapshot: async () => null,
      saveFreshSnapshot: async (snapshot) => snapshot
    }
  });

  const result = await service.getRates("UGX");
  assert.equal(providerCalls, 0);
  assert.equal(result.source, "database_cache");
  assert.equal(result.snapshot, cachedSnapshot);
});

test("stale cache triggers provider refresh and persistence", async () => {
  let providerCalls = 0;
  let savedSnapshot = null;
  const service = createExchangeRateService({
    now: fixedNow,
    cacheTtlMs: 1000,
    provider: {
      fetchRates: async () => {
        providerCalls += 1;
        return { provider: "mock", baseCurrency: "UGX", rates: { UGX: 1, USD: 0.00027 }, retrievedAt: fixedNow().toISOString() };
      }
    },
    repository: {
      findLatestUsableSnapshot: async () => null,
      findLatestSnapshot: async () => null,
      saveFreshSnapshot: async (snapshot) => {
        savedSnapshot = snapshot;
        return snapshot;
      }
    }
  });

  const result = await service.getRates("UGX");
  assert.equal(providerCalls, 1);
  assert.equal(result.source, "mock_provider");
  assert.equal(savedSnapshot.baseCurrency, "UGX");
});

test("provider failure returns the latest cached snapshot", async () => {
  const fallbackSnapshot = { baseCurrency: 'UGX', provider: 'mock', rates: { UGX: 1, USD: 0.00027 }, retrievedAt: new Date(fixedNow().getTime() - 2000), expiresAt: new Date(fixedNow().getTime() - 1000) };
  const service = createExchangeRateService({
    now: fixedNow,
    provider: { fetchRates: async () => { throw Object.assign(new Error("offline"), { code: "EXCHANGE_RATE_PROVIDER_UNAVAILABLE" }); } },
    repository: {
      findLatestUsableSnapshot: async () => null,
      findLatestSnapshot: async () => fallbackSnapshot,
      saveFreshSnapshot: async (snapshot) => snapshot
    }
  });

  const result = await service.getRates("UGX");
  assert.equal(result.state, "fallback");
  assert.equal(result.snapshot, fallbackSnapshot);
});

test("provider and cache failure returns controlled unavailable error", async () => {
  const service = createExchangeRateService({
    now: fixedNow,
    provider: { fetchRates: async () => { throw new Error("offline"); } },
    repository: {
      findLatestUsableSnapshot: async () => null,
      findLatestSnapshot: async () => null,
      saveFreshSnapshot: async (snapshot) => snapshot
    }
  });

  await assert.rejects(service.getRates("UGX"), (error) => error.code === "EXCHANGE_RATE_CACHE_UNAVAILABLE");
});

test('invalid currency is rejected before accessing provider or storage', async () => {
  const unexpected = async () => { throw new Error('unexpected call'); };
  const service = createExchangeRateService({ provider: { fetchRates: unexpected }, repository: { findLatestUsableSnapshot: unexpected, findLatestSnapshot: unexpected, saveFreshSnapshot: unexpected } });
  for (const currency of ['ZZZ', [], 'UGX/USD']) await assert.rejects(service.getRates(currency), { code: 'EXCHANGE_RATE_INVALID_BASE_CURRENCY' });
});

test('explicit refresh bypasses the fresh cache and mismatched provider bases fail closed', async () => {
  const service = createExchangeRateService({ provider: { fetchRates: async () => ({ provider: 'mock', baseCurrency: 'USD', rates: { USD: 1 }, retrievedAt: fixedNow() }) }, repository: {
    findLatestUsableSnapshot: async () => { throw new Error('refresh should skip cache'); },
    findLatestSnapshot: async () => null,
    saveFreshSnapshot: async () => { assert.fail('wrong base must not be persisted'); },
  } });
  await assert.rejects(service.refreshRates('UGX'), { code: 'EXCHANGE_RATE_CACHE_UNAVAILABLE' });
});
