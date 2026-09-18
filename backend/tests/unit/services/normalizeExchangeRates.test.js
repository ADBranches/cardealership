"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeExchangeRates } = require("../../../services/exchangeRates/normalizeExchangeRates");

test("normalizes valid provider output", () => {
  const normalized = normalizeExchangeRates({ provider: "mock", baseCurrency: "ugx", rates: { ugx: 1, usd: 0.00027 }, retrievedAt: "2026-09-18T10:00:00.000Z" }, { cacheTtlMs: 7200000 });
  assert.equal(normalized.baseCurrency, "UGX");
  assert.equal(normalized.rates.USD, 0.00027);
  assert.equal(normalized.expiresAt.toISOString(), "2026-09-18T12:00:00.000Z");
  assert.equal(Object.isFrozen(normalized), true);
  assert.equal(Object.isFrozen(normalized.rates), true);
});

test("rejects malformed provider responses", () => {
  const invalidResponses = [null, [], {}, { baseCurrency: "UGX", rates: {} }, { baseCurrency: "UGX", rates: { UGX: 0 } }, { baseCurrency: "UGX", rates: { UGX: 1, USD: Infinity } }];
  for (const invalidResponse of invalidResponses) {
    assert.throws(() => normalizeExchangeRates(invalidResponse, { cacheTtlMs: 7200000 }), TypeError);
  }
});

test("requires the base-currency rate to equal one", () => {
  assert.throws(() => normalizeExchangeRates({ provider: "mock", baseCurrency: "UGX", rates: { UGX: 2 }, retrievedAt: "2026-09-18T10:00:00.000Z" }, { cacheTtlMs: 7200000 }), TypeError);
});
