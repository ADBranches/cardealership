import assert from "node:assert/strict";
import {
  canSubmitWithAvailability,
  isSelectedTimeAvailable,
  shouldClearSelectedTime,
} from "../features/test-drive/utils/availabilitySelection";
import type { AvailabilityResult } from "../features/test-drive/types";

const ready: AvailabilityResult = {
  success: true,
  vehicleId: "101",
  date: "2026-08-20",
  slots: [
    { time: "09:00", available: true },
    { time: "10:00", available: false },
  ],
  availableSlots: ["09:00"],
  reservedSlots: ["10:00"],
  mock: true,
  message: "Synthetic availability.",
};

assert.equal(isSelectedTimeAvailable("09:00", ready), true);
assert.equal(isSelectedTimeAvailable("10:00", ready), false);
assert.equal(isSelectedTimeAvailable("", ready), false);
assert.equal(shouldClearSelectedTime("10:00", ready), true);
assert.equal(shouldClearSelectedTime("09:00", ready), false);
assert.equal(shouldClearSelectedTime("", ready), false);
assert.equal(canSubmitWithAvailability("ready", "09:00", ready), true);
assert.equal(canSubmitWithAvailability("loading", "09:00", ready), false);
assert.equal(canSubmitWithAvailability("error", "09:00", ready), false);
assert.equal(canSubmitWithAvailability("ready", "10:00", ready), false);

console.log(JSON.stringify({
  suite: "availabilitySelection",
  passed: 10,
  failed: 0,
}, null, 2));
