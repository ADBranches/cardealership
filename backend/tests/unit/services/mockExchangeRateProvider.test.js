"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const configuration = require("../../../config/exchangeRates");
const { EXCHANGE_RATE_ERROR_CODES } = require("../../../contracts/exchangeRate.contract");
const { createMockExchangeRateProvider } = require("../../../services/exchangeRates/mockExchangeRateProvider");

test("success scenario returns deterministic rates", async () => {
  const provider = createMockExchangeRateProvider({ scenario: "success", now: () => new Date("2026-09-18T10:00:00.000Z") });
  const firstResult = await provider.fetchRates("UGX");
  const secondResult = await provider.fetchRates("UGX");
  assert.deepEqual(firstResult, secondResult);
  assert.deepEqual(firstResult.rates, configuration.mockRates);
  assert.equal(firstResult.baseCurrency, "UGX");
});

test("timeout scenario fails deterministically", async () => {
  const provider = createMockExchangeRateProvider({ scenario: "timeout" });
  await assert.rejects(provider.fetchRates("UGX"), (error) => error.code === EXCHANGE_RATE_ERROR_CODES.PROVIDER_TIMEOUT);
});

test("unavailable scenario fails deterministically", async () => {
  const provider = createMockExchangeRateProvider({ scenario: "unavailable" });
  await assert.rejects(provider.fetchRates("UGX"), (error) => error.code === EXCHANGE_RATE_ERROR_CODES.PROVIDER_UNAVAILABLE);
});

test("malformed scenario returns data rejected by normalization", async () => {
  const provider = createMockExchangeRateProvider({ scenario: "malformed_response" });
  const response = await provider.fetchRates("UGX");
  assert.equal(response.rates.USD, -1);
});

test("unsupported scenario fails deterministically", async () => {
  const provider = createMockExchangeRateProvider({ scenario: "unknown" });
  await assert.rejects(provider.fetchRates("UGX"), (error) => error.code === EXCHANGE_RATE_ERROR_CODES.MALFORMED_RESPONSE);
});
