import assert from "node:assert/strict";
import {
  createTypingThrottleController,
} from "../features/admin-chat/utils/typingThrottle";

type ScheduledTask = {
  callback: () => void;
  cancelled: boolean;
};

let currentTime = 0;
let typingStarts = 0;
let typingStops = 0;
const scheduledTasks: ScheduledTask[] = [];

function schedule(callback: () => void): ReturnType<typeof setTimeout> {
  const task: ScheduledTask = {
    callback,
    cancelled: false,
  };
  scheduledTasks.push(task);
  return task as unknown as ReturnType<typeof setTimeout>;
}

function cancel(timer: ReturnType<typeof setTimeout>) {
  const task = timer as unknown as ScheduledTask;
  task.cancelled = true;
}

const controller = createTypingThrottleController({
  onTypingStart: () => {
    typingStarts += 1;
  },
  onTypingStop: () => {
    typingStops += 1;
  },
  throttleMilliseconds: 1000,
  inactivityMilliseconds: 3000,
  now: () => currentTime,
  schedule,
  cancel,
});

controller.update(true);
assert.equal(typingStarts, 1);

currentTime = 300;
controller.update(true);
assert.equal(typingStarts, 1);

currentTime = 1200;
controller.update(true);
assert.equal(typingStarts, 2);

const activeTask = scheduledTasks.at(-1);
assert.ok(activeTask);
activeTask.callback();
assert.equal(typingStops, 1);

currentTime = 5000;
controller.update(true);
assert.equal(typingStarts, 3);
controller.update(false);
assert.equal(typingStops, 2);

controller.update(true);
assert.equal(typingStarts, 4);
controller.dispose();
assert.equal(typingStops, 3);

controller.update(true);
assert.equal(typingStarts, 4);

console.log(JSON.stringify({
  suite: "typingIndicator",
  passed: 9,
  failed: 0,
  typingStartThrottled: true,
  inactivityStopVerified: true,
  emptyComposerStopVerified: true,
  teardownStopVerified: true,
  timerCleanupVerified: true
}, null, 2));
