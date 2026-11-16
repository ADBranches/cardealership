"use strict";

export const FIXED_TIME = new Date("2026-09-18T10:00:00.000Z");

export const createSnapshot = (overrides = {}) => Object.freeze({
  baseCurrency: "UGX",
  rates: Object.freeze({
    UGX: 1,
    USD: 0.00027,
    EUR: 0.00023,
    GBP: 0.00020,
    KES: 0.0348
  }),
  provider: "mock",
  retrievedAt: new Date(FIXED_TIME),
  expiresAt: new Date(FIXED_TIME.getTime() + 7200000),
  ...overrides
});

export const providerCacheMatrix = Object.freeze([
  Object.freeze({
    name: "fresh cache suppresses provider",
    freshCache: createSnapshot(),
    providerFails: false,
    latestCache: null,
    expectedSource: "database_cache",
    expectedState: "fresh",
    expectedProviderCalls: 0
  }),
  Object.freeze({
    name: "stale cache refreshes from provider",
    freshCache: null,
    providerFails: false,
    latestCache: createSnapshot(),
    expectedSource: "mock_provider",
    expectedState: "fresh",
    expectedProviderCalls: 1
  }),
  Object.freeze({
    name: "provider failure returns cached fallback",
    freshCache: null,
    providerFails: true,
    latestCache: createSnapshot(),
    expectedSource: "database_cache",
    expectedState: "fallback",
    expectedProviderCalls: 1
  }),
  Object.freeze({
    name: "provider and cache failure returns unavailable",
    freshCache: null,
    providerFails: true,
    latestCache: null,
    expectedErrorCode: "EXCHANGE_RATE_CACHE_UNAVAILABLE",
    expectedProviderCalls: 1
  })
]);
