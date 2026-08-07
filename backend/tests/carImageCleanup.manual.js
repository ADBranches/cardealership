import assert from "node:assert/strict";
import {
  hasCleanupMediaLinks,
  isCleanupEligibleStatus,
  isCleanupProtectedStatus,
  isOlderThanDays,
} from "../utils/carImageCleanupContract.js";
import {
  deleteMediaBatch,
  deleteMediaObject,
} from "../services/storageCleanupService.js";

const NOW = new Date("2026-07-27T12:00:00.000Z");
const OLD_DATE = "2026-06-01T00:00:00.000Z";
const RECENT_DATE = "2026-07-20T00:00:00.000Z";

function isSelectedForCleanup(listing, olderThanDays = 30) {
  return (
    isCleanupEligibleStatus(listing.status) &&
    !isCleanupProtectedStatus(listing.status) &&
    isOlderThanDays(listing.updated_at, olderThanDays, NOW) &&
    hasCleanupMediaLinks(listing)
  );
}

function parseCleanupMode(args = []) {
  const execute = args.includes("--execute");
  return {
    execute,
    dryRun: !execute || args.includes("--dry-run"),
  };
}

const testCases = [
  {
    name: "Draft older than 30 days is selected",
    run: () => assert.equal(isSelectedForCleanup({ status: "Draft", updated_at: OLD_DATE, images: ["https://example.com/draft.jpg"] }), true),
  },
  {
    name: "Deleted older than 30 days is selected",
    run: () => assert.equal(isSelectedForCleanup({ status: "Deleted", updated_at: OLD_DATE, images: ["https://example.com/deleted.jpg"] }), true),
  },
  {
    name: "Draft newer than 30 days is skipped",
    run: () => assert.equal(isSelectedForCleanup({ status: "Draft", updated_at: RECENT_DATE, images: ["https://example.com/recent-draft.jpg"] }), false),
  },
  {
    name: "Deleted newer than 30 days is skipped",
    run: () => assert.equal(isSelectedForCleanup({ status: "Deleted", updated_at: RECENT_DATE, images: ["https://example.com/recent-deleted.jpg"] }), false),
  },
  {
    name: "Available listing is skipped",
    run: () => assert.equal(isSelectedForCleanup({ status: "Available", updated_at: OLD_DATE, images: ["https://example.com/available.jpg"] }), false),
  },
  {
    name: "Sold listing is skipped",
    run: () => assert.equal(isSelectedForCleanup({ status: "Sold", updated_at: OLD_DATE, images: ["https://example.com/sold.jpg"] }), false),
  },
  {
    name: "Listing with no images is handled safely",
    run: () => assert.equal(isSelectedForCleanup({ status: "Draft", updated_at: OLD_DATE, images: [] }), false),
  },
  {
    name: "Malformed media link is skipped safely",
    run: async () => {
      const result = await deleteMediaObject({ imageUrl: "" });
      assert.equal(result.deleted, false);
      assert.equal(result.skipped, true);
      assert.match(result.reason, /missing/i);
    },
  },
  {
    name: "Dry-run-safe storage adapter does not delete anything",
    run: async () => {
      const result = await deleteMediaBatch([{ imageUrl: "https://example.com/car.jpg" }]);
      assert.equal(result.deletedCount, 0);
      assert.equal(result.skippedCount, 1);
      assert.equal(result.destructive, false);
    },
  },
  {
    name: "Execute mode requires explicit flag",
    run: () => {
      assert.deepEqual(parseCleanupMode([]), { execute: false, dryRun: true });
      assert.deepEqual(parseCleanupMode(["--dry-run"]), { execute: false, dryRun: true });
      assert.deepEqual(parseCleanupMode(["--execute"]), { execute: true, dryRun: false });
      assert.deepEqual(parseCleanupMode(["--execute", "--dry-run"]), { execute: true, dryRun: true });
    },
  },
];

let passed = 0;
let failed = 0;
const failures = [];

for (const testCase of testCases) {
  try {
    await testCase.run();
    passed += 1;
    console.log(`PASS: ${testCase.name}`);
  } catch (error) {
    failed += 1;
    failures.push({ name: testCase.name, message: error.message });
    console.log(`FAIL: ${testCase.name}`);
  }
}

console.log(JSON.stringify({ total: testCases.length, passed, failed, failures, destructive: false }, null, 2));

if (failed > 0) {
  process.exitCode = 1;
}
