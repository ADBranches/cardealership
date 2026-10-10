"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createExchangeRateService } = require("../../../services/exchangeRates/exchangeRateService");

const fixedNow = () => new Date("2026-09-18T10:00:00.000Z");

test("fresh cache suppresses provider calls", async () => {
  let providerCalls = 0;
  const cachedSnapshot = { baseCurrency: "UGX" };
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
  const fallbackSnapshot = { baseCurrency: "UGX", provider: "mock" };
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
