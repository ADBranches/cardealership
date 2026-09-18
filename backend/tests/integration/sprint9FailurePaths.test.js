"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createExchangeRateService } = require("../../services/exchangeRates/exchangeRateService");
const { createBulkCarImageUploadService } = require("../../services/bulkCarImageUploadService");
const { createExchangeRateRefreshWorker } = require("../../workers/exchangeRateRefreshWorker");
const { FIXED_TIME, createSnapshot, providerCacheMatrix } = require("../fixtures/exchangeRateFixtures");
const { bulkUploadMatrix } = require("../fixtures/bulkImageUploadFixtures");

for (const scenario of providerCacheMatrix) {
  test(`exchange-rate graph: ${scenario.name}`, async () => {
    let providerCalls = 0;
    let persistenceCalls = 0;

    const service = createExchangeRateService({
      now: () => new Date(FIXED_TIME),
      cacheTtlMs: 7200000,
      provider: {
        fetchRates: async () => {
          providerCalls += 1;
          if (scenario.providerFails) {
            const error = new Error("Provider unavailable");
            error.code = "EXCHANGE_RATE_PROVIDER_UNAVAILABLE";
            throw error;
          }
          return createSnapshot();
        }
      },
      repository: {
        findLatestUsableSnapshot: async () => scenario.freshCache,
        findLatestSnapshot: async () => scenario.latestCache,
        saveFreshSnapshot: async (snapshot) => {
          persistenceCalls += 1;
          return snapshot;
        }
      }
    });

    if (scenario.expectedErrorCode) {
      await assert.rejects(
        service.getRates("UGX"),
        (error) => error.code === scenario.expectedErrorCode
      );
    } else {
      const result = await service.getRates("UGX");
      assert.equal(result.source, scenario.expectedSource);
      assert.equal(result.state, scenario.expectedState);
    }

    assert.equal(providerCalls, scenario.expectedProviderCalls);

    if (scenario.expectedSource === "mock_provider") {
      assert.equal(persistenceCalls, 1);
    } else {
      assert.equal(persistenceCalls, 0);
    }
  });
}

for (const scenario of bulkUploadMatrix) {
  test(`bulk-upload graph: ${scenario.name}`, async () => {
    const activity = {
      storageCalls: [],
      persistenceCalls: [],
      cleanupCalls: []
    };

    const service = createBulkCarImageUploadService({
      vehicleRepository: {
        findById: async (vehicleId) => scenario.vehicleExists ? { id: vehicleId } : null
      },
      imageStorage: {
        store: async (file) => {
          activity.storageCalls.push(file.clientFileId);
          if (scenario.storageFailureIds.includes(file.clientFileId)) {
            throw new Error("Storage failure");
          }
          return {
            storageKey: `cars/${file.vehicleId}/${file.clientFileId}`,
            url: `/uploads/${file.fileName}`
          };
        },
        remove: async (storageKey) => {
          activity.cleanupCalls.push(storageKey.split("/").at(-1));
        }
      },
      imageRepository: {
        save: async (metadata) => {
          activity.persistenceCalls.push(metadata.clientFileId);
          if (scenario.persistenceFailureIds.includes(metadata.clientFileId)) {
            throw new Error("Persistence failure");
          }
          return {
            id: `image-${metadata.clientFileId}`,
            url: metadata.url
          };
        }
      }
    });

    if (scenario.expectedErrorCode) {
      await assert.rejects(
        service.processBulkUpload({
          vehicleId: "car-123",
          files: scenario.files
        }),
        (error) => error.code === scenario.expectedErrorCode
      );
      assert.equal(activity.storageCalls.length, scenario.expectedStorageCalls);
      return;
    }

    const result = await service.processBulkUpload({
      vehicleId: "car-123",
      files: scenario.files
    });

    assert.deepEqual(
      result.files.map((file) => file.clientFileId),
      scenario.files.map((file) => file.clientFileId)
    );
    assert.deepEqual(
      result.files.map((file) => file.status),
      scenario.expectedStatuses
    );
    assert.equal(result.summary.uploaded, scenario.expectedUploaded);
    assert.equal(result.summary.rejected, scenario.expectedRejected);
    assert.equal(result.summary.failed, scenario.expectedFailed);

    if (scenario.expectedCleanupIds) {
      assert.deepEqual(activity.cleanupCalls, scenario.expectedCleanupIds);
    }
  });
}

test("worker lifecycle graph leaves no timer or in-flight refresh", async () => {
  const timerActivity = {
    active: false,
    cleared: false,
    unreferenced: false
  };

  const timerHandle = {
    unref() {
      timerActivity.unreferenced = true;
    }
  };

  const worker = createExchangeRateRefreshWorker({
    service: {
      refreshRates: async () => ({})
    },
    intervalMs: 1000,
    timers: {
      setInterval: () => {
        timerActivity.active = true;
        return timerHandle;
      },
      clearInterval: (handle) => {
        assert.equal(handle, timerHandle);
        timerActivity.active = false;
        timerActivity.cleared = true;
      }
    }
  });

  assert.equal(worker.start(), true);
  assert.equal(worker.isRunning(), true);
  assert.equal(timerActivity.unreferenced, true);

  await worker.tick();

  assert.equal(worker.isRefreshInFlight(), false);
  assert.equal(worker.stop(), true);
  assert.equal(worker.isRunning(), false);
  assert.equal(timerActivity.active, false);
  assert.equal(timerActivity.cleared, true);
});
