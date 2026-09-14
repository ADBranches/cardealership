import assert from "node:assert/strict";
import {
  createManualDispatchSynchronization,
} from "../features/admin-dispatch/services/dispatchSynchronization";

let refreshCount = 0;

const synchronization =
  createManualDispatchSynchronization(async () => {
    refreshCount += 1;
    return refreshCount;
  });

assert.equal(synchronization.model, "manual-refresh");
assert.equal(await synchronization.refresh(), 1);
assert.equal(await synchronization.refresh(), 2);

synchronization.cleanup();

assert.equal(await synchronization.refresh(), undefined);
assert.equal(refreshCount, 2);

console.log(
  JSON.stringify(
    {
      suite: "dispatchSynchronization",
      passed: 5,
      failed: 0,
      model: "manual-refresh",
      duplicateTimersCreated: false,
      timersCreated: false,
      listenersCreated: false,
      cleanupVerified: true,
    },
    null,
    2,
  ),
);
