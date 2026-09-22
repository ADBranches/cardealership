import test from "node:test";
import assert from "node:assert/strict";
import {
  createExchangeRateController,
} from "../../controllers/exchangeRateController.js";
import {
  createExchangeRateRouter,
} from "../../routes/exchangeRateRoutes.js";
import {
  createExchangeRateRefreshWorker,
} from "../../workers/exchangeRateRefreshWorker.js";

const snapshot = Object.freeze({
  baseCurrency: "UGX",
  rates: Object.freeze({
    UGX: 1,
    USD: 0.00027,
  }),
  provider: "mock",
  retrievedAt: new Date(
    "2026-09-18T10:00:00.000Z",
  ),
  expiresAt: new Date(
    "2026-09-18T12:00:00.000Z",
  ),
});

test("controller returns the stable API contract", async () => {
  const controller = createExchangeRateController({
    async getRates() {
      return {
        state: "fresh",
        source: "mock_provider",
        snapshot,
      };
    },
  });

  const activity = {};
  const response = {
    status(statusCode) {
      activity.statusCode = statusCode;
      return this;
    },
    json(body) {
      activity.body = body;
      return this;
    },
  };

  await controller.getExchangeRates(
    { query: { baseCurrency: "UGX" } },
    response,
  );

  assert.equal(activity.statusCode, 200);
  assert.equal(activity.body.source, "mock_provider");
  assert.equal(activity.body.rates.USD, 0.00027);
});

test("router registers one GET endpoint", () => {
  const router = createExchangeRateRouter({
    async getRates() {
      return {};
    },
  });

  const routes = router.stack.filter(
    (layer) => layer.route,
  );

  assert.equal(routes.length, 1);
  assert.equal(routes[0].route.path, "/");
  assert.equal(routes[0].route.methods.get, true);
});

test("worker shares concurrent refresh execution", async () => {
  let releaseRefresh;
  let refreshCalls = 0;

  const pendingRefresh = new Promise((resolve) => {
    releaseRefresh = resolve;
  });

  const worker = createExchangeRateRefreshWorker({
    service: {
      async refreshRates() {
        refreshCalls += 1;
        await pendingRefresh;
      },
    },
  });

  const firstTick = worker.tick();
  const secondTick = worker.tick();

  assert.equal(firstTick, secondTick);
  assert.equal(refreshCalls, 1);

  releaseRefresh();
  await firstTick;

  assert.equal(worker.isRefreshInFlight(), false);
});
