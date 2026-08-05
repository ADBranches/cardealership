import { randomUUID } from "node:crypto";
import { deleteCarImageRecordById } from "../models/carsModel.js";
import { findStaleCarMediaCandidates } from "./staleCarMediaService.js";
import { deleteMediaBatch, getStorageCleanupReadiness } from "./storageCleanupService.js";

function flattenCandidateMedia(candidates = []) {
  return candidates.flatMap((candidate) => candidate.media.map((mediaItem) => ({ ...mediaItem, carId: candidate.carId, status: candidate.status, candidateTimestamp: candidate.candidateTimestamp })));
}

function buildDryRunStorageResults(mediaItems = []) {
  return mediaItems.map((mediaItem) => ({ provider: "dry-run", mediaUrl: mediaItem.imageUrl || mediaItem.image_url || "", carId: mediaItem.carId, imageId: mediaItem.imageId, deleted: false, skipped: true, reason: "Dry-run mode is enabled. Storage deletion was not attempted." }));
}

function summarizeStorageResults(results = []) {
  return { requestedCount: results.length, deletedCount: results.filter((result) => result.deleted).length, skippedCount: results.filter((result) => result.skipped).length };
}

function getStorageResultForImage(storageResults = [], mediaItem = {}) {
  return storageResults.find((result) => {
    if (mediaItem.imageId && result.imageId === mediaItem.imageId) return true;
    const mediaUrl = mediaItem.imageUrl || mediaItem.image_url;
    return mediaUrl && result.mediaUrl === mediaUrl;
  });
}

function shouldCleanDatabaseLink({ storageResult, options }) {
  if (!storageResult) return false;
  if (storageResult.deleted === true) return true;
  return storageResult.skipped === true && options.allowDatabaseCleanupWhenStorageSkipped === true;
}

async function cleanDatabaseMediaLinks({ mediaItems, storageResults, candidateSchema, options }) {
  if (options.cleanDatabaseLinks !== true) return { attempted: false, cleanedLinkCount: 0, failureCount: 0, errors: [], reason: "Database media-link cleanup is disabled by default. Pass cleanDatabaseLinks=true after team approval.", results: [] };
  const results = [];
  const errors = [];
  let cleanedLinkCount = 0;
  for (const mediaItem of mediaItems) {
    const storageResult = getStorageResultForImage(storageResults, mediaItem);
    if (!shouldCleanDatabaseLink({ storageResult, options })) {
      results.push({ carId: mediaItem.carId, imageId: mediaItem.imageId, cleaned: false, skipped: true, reason: "Storage cleanup did not meet the approved database cleanup policy." });
      continue;
    }
    if (!mediaItem.imageId) {
      results.push({ carId: mediaItem.carId, imageId: null, cleaned: false, skipped: true, reason: "Image id is missing, so database media-link cleanup was skipped." });
      continue;
    }
    try {
      const deleteResult = await deleteCarImageRecordById({ imageId: mediaItem.imageId, statuses: options.statuses, olderThanDays: options.olderThanDays, timestampField: candidateSchema?.timestampField });
      cleanedLinkCount += deleteResult.deletedCount;
      results.push({ carId: mediaItem.carId, imageId: mediaItem.imageId, cleaned: deleteResult.deletedCount > 0, skipped: deleteResult.deletedCount === 0, deletedCount: deleteResult.deletedCount });
    } catch (error) {
      errors.push({ code: error.code || "DATABASE_CLEANUP_FAILED", message: "A database media-link cleanup operation failed." });
      results.push({ carId: mediaItem.carId, imageId: mediaItem.imageId, cleaned: false, skipped: true, reason: "Database cleanup failed safely." });
    }
  }
  return { attempted: true, cleanedLinkCount, failureCount: errors.length, errors, reason: "Database media-link cleanup only removed records that still matched the stale Draft/Deleted eligibility query.", results };
}

export async function cleanupStaleCarImages(options = {}) {
  const runId = randomUUID();
  const dryRun = options.dryRun !== false;
  const startedAt = new Date().toISOString();
  const candidateResult = await findStaleCarMediaCandidates(options);
  const mediaItems = flattenCandidateMedia(candidateResult.candidates);
  let storageCleanup;
  if (dryRun) {
    const results = buildDryRunStorageResults(mediaItems);
    storageCleanup = { provider: "dry-run", destructive: false, failureCount: 0, errors: [], ...summarizeStorageResults(results), results };
  } else {
    storageCleanup = await deleteMediaBatch(mediaItems, { provider: options.provider, execute: options.execute === true });
    storageCleanup.failureCount = storageCleanup.results.filter((result) => result.deleted === false && result.skipped === false).length;
    storageCleanup.errors = [];
  }
  const databaseCleanup = dryRun ? { attempted: false, cleanedLinkCount: 0, failureCount: 0, errors: [], reason: "Dry-run mode is enabled. Database media-link cleanup was not attempted.", results: [] } : await cleanDatabaseMediaLinks({ mediaItems, storageResults: storageCleanup.results, candidateSchema: candidateResult.schema, options });
  const finishedAt = new Date().toISOString();
  const deletedCount = storageCleanup.deletedCount || 0;
  const skippedCount = storageCleanup.skippedCount || 0;
  const failureCount = (storageCleanup.failureCount || 0) + (databaseCleanup.failureCount || 0);
  const errors = [...(storageCleanup.errors || []), ...(databaseCleanup.errors || [])];
  return { runId, startedAt, finishedAt, dryRun, olderThanDays: candidateResult.options.olderThanDays, statusesScanned: candidateResult.options.statuses, candidateCount: candidateResult.candidates.length, mediaCount: mediaItems.length, deletedCount, skippedCount, failureCount, errors, destructive: false, candidateOptions: candidateResult.options, storageReadiness: getStorageCleanupReadiness({ execute: options.execute === true }), candidateSummary: { candidateCarCount: candidateResult.candidates.length, candidateMediaCount: mediaItems.length, skipped: candidateResult.skipped, reason: candidateResult.reason, schema: candidateResult.schema }, storageCleanup, databaseCleanup, candidates: candidateResult.candidates };
}
