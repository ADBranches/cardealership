"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createExchangeRateController } = require("../../controllers/exchangeRateController");
const { createExchangeRateRouter } = require("../../routes/exchangeRateRoutes");

const createResponse = () => {
  const activity = { statusCode: null, body: null };
  return {
    activity,
    status(statusCode) {
      activity.statusCode = statusCode;
      return this;
    },
    json(body) {
      activity.body = body;
      return this;
    }
  };
};

const snapshot = {
  baseCurrency: "UGX",
  rates: new Map([["UGX", 1], ["USD", 0.00027]]),
  provider: "mock",
  retrievedAt: new Date("2026-09-18T10:00:00.000Z"),
  expiresAt: new Date("2026-09-18T12:00:00.000Z")
};

test("fresh provider response matches the stable API contract", async () => {
  const controller = createExchangeRateController({
    getRates: async () => ({ state: "fresh", source: "mock_provider", snapshot })
  });
  const response = createResponse();
  await controller.getExchangeRates({ query: { baseCurrency: "UGX" } }, response);
  assert.equal(response.activity.statusCode, 200);
  assert.equal(response.activity.body.source, "mock_provider");
  assert.equal(response.activity.body.freshness, "fresh");
  assert.equal(response.activity.body.baseCurrency, "UGX");
  assert.equal(response.activity.body.rates.USD, 0.00027);
  assert.equal(response.activity.body.retrievedAt, "2026-09-18T10:00:00.000Z");
});

test("fresh cache response is distinguished from provider output", async () => {
  const controller = createExchangeRateController({
    getRates: async () => ({ state: "fresh", source: "database_cache", snapshot })
  });
  const response = createResponse();
  await controller.getExchangeRates({ query: {} }, response);
  assert.equal(response.activity.statusCode, 200);
  assert.equal(response.activity.body.source, "database_cache");
  assert.equal(response.activity.body.freshness, "fresh");
  assert.equal(response.activity.body.warning, undefined);
});

test("stale cache fallback includes a provider warning", async () => {
  const controller = createExchangeRateController({
    getRates: async () => ({ state: "fallback", source: "database_cache", snapshot, providerErrorCode: "EXCHANGE_RATE_PROVIDER_UNAVAILABLE" })
  });
  const response = createResponse();
  await controller.getExchangeRates({ query: {} }, response);
  assert.equal(response.activity.statusCode, 200);
  assert.equal(response.activity.body.freshness, "fallback");
  assert.equal(response.activity.body.warning.code, "EXCHANGE_RATE_PROVIDER_UNAVAILABLE");
});

test("provider and cache unavailability returns HTTP 503", async () => {
  const unavailableError = new Error("Unavailable");
  unavailableError.code = "EXCHANGE_RATE_CACHE_UNAVAILABLE";
  const controller = createExchangeRateController({
    getRates: async () => { throw unavailableError; }
  });
  const response = createResponse();
  await controller.getExchangeRates({ query: {} }, response);
  assert.equal(response.activity.statusCode, 503);
  assert.equal(response.activity.body.success, false);
  assert.equal(response.activity.body.error.code, "EXCHANGE_RATE_CACHE_UNAVAILABLE");
});

test("unexpected provider exceptions return a controlled HTTP 500 response", async () => {
  const controller = createExchangeRateController({
    getRates: async () => { throw new Error("Unexpected failure"); }
  });
  const response = createResponse();
  await controller.getExchangeRates({ query: {} }, response);
  assert.equal(response.activity.statusCode, 500);
  assert.equal(response.activity.body.success, false);
});

test("router registers one GET endpoint", () => {
  const router = createExchangeRateRouter({ getRates: async () => ({}) });
  const routeLayers = router.stack.filter((layer) => layer.route);
  assert.equal(routeLayers.length, 1);
  assert.equal(routeLayers[0].route.path, "/");
  assert.equal(routeLayers[0].route.methods.get, true);
});
