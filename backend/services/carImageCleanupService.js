import { deleteCarImageRecordById } from "../models/carsModel.js";
import { findStaleCarMediaCandidates } from "./staleCarMediaService.js";
import { deleteMediaBatch, getStorageCleanupReadiness } from "./storageCleanupService.js";

function flattenCandidateMedia(candidates = []) {
  return candidates.flatMap((candidate) =>
    candidate.media.map((mediaItem) => ({
      ...mediaItem,
      carId: candidate.carId,
      status: candidate.status,
      candidateTimestamp: candidate.candidateTimestamp,
    }))
  );
}

function buildDryRunStorageResults(mediaItems = []) {
  return mediaItems.map((mediaItem) => ({
    provider: "dry-run",
    mediaUrl: mediaItem.imageUrl || mediaItem.image_url || "",
    carId: mediaItem.carId,
    imageId: mediaItem.imageId,
    deleted: false,
    skipped: true,
    reason: "Dry-run mode is enabled. Storage deletion was not attempted.",
  }));
}

function summarizeStorageResults(results = []) {
  return {
    requestedCount: results.length,
    deletedCount: results.filter((result) => result.deleted).length,
    skippedCount: results.filter((result) => result.skipped).length,
  };
}

function getStorageResultForImage(storageResults = [], mediaItem = {}) {
  return storageResults.find((result) => {
    if (mediaItem.imageId && result.imageId === mediaItem.imageId) {
      return true;
    }

    const mediaUrl = mediaItem.imageUrl || mediaItem.image_url;
    return mediaUrl && result.mediaUrl === mediaUrl;
  });
}

function shouldCleanDatabaseLink({ storageResult, options }) {
  if (!storageResult) {
    return false;
  }

  if (storageResult.deleted === true) {
    return true;
  }

  return storageResult.skipped === true && options.allowDatabaseCleanupWhenStorageSkipped === true;
}

async function cleanDatabaseMediaLinks({ mediaItems, storageResults, candidateSchema, options }) {
  if (options.cleanDatabaseLinks !== true) {
    return {
      attempted: false,
      cleanedLinkCount: 0,
      reason: "Database media-link cleanup is disabled by default. Pass cleanDatabaseLinks=true after team approval.",
      results: [],
    };
  }

  const results = [];
  let cleanedLinkCount = 0;

  for (const mediaItem of mediaItems) {
    const storageResult = getStorageResultForImage(storageResults, mediaItem);

    if (!shouldCleanDatabaseLink({ storageResult, options })) {
      results.push({
        carId: mediaItem.carId,
        imageId: mediaItem.imageId,
        cleaned: false,
        skipped: true,
        reason: "Storage cleanup did not meet the approved database cleanup policy.",
      });
      continue;
    }

    if (!mediaItem.imageId) {
      results.push({
        carId: mediaItem.carId,
        imageId: mediaItem.imageId,
        cleaned: false,
        skipped: true,
        reason: "Image id is missing, so database media-link cleanup was skipped.",
      });
      continue;
    }

    const deleteResult = await deleteCarImageRecordById({
      imageId: mediaItem.imageId,
      statuses: options.statuses,
      olderThanDays: options.olderThanDays,
      timestampField: candidateSchema?.timestampField,
    });

    cleanedLinkCount += deleteResult.deletedCount;
    results.push({
      carId: mediaItem.carId,
      imageId: mediaItem.imageId,
      cleaned: deleteResult.deletedCount > 0,
      skipped: deleteResult.deletedCount === 0,
      deletedCount: deleteResult.deletedCount,
    });
  }

  return {
    attempted: true,
    cleanedLinkCount,
    reason: "Database media-link cleanup only removed records that still matched the stale Draft/Deleted eligibility query.",
    results,
  };
}

export async function cleanupStaleCarImages(options = {}) {
  const dryRun = options.dryRun !== false;
  const startedAt = new Date().toISOString();
  const candidateResult = await findStaleCarMediaCandidates(options);
  const mediaItems = flattenCandidateMedia(candidateResult.candidates);

  let storageCleanup;

  if (dryRun) {
    const results = buildDryRunStorageResults(mediaItems);
    storageCleanup = {
      provider: "dry-run",
      destructive: false,
      ...summarizeStorageResults(results),
      results,
    };
  } else {
    storageCleanup = await deleteMediaBatch(mediaItems, {
      provider: options.provider,
      execute: options.execute === true,
    });
  }

  const databaseCleanup = dryRun
    ? {
        attempted: false,
        cleanedLinkCount: 0,
        reason: "Dry-run mode is enabled. Database media-link cleanup was not attempted.",
        results: [],
      }
    : await cleanDatabaseMediaLinks({
        mediaItems,
        storageResults: storageCleanup.results,
        candidateSchema: candidateResult.schema,
        options,
      });

  const finishedAt = new Date().toISOString();

  return {
    startedAt,
    finishedAt,
    dryRun,
    destructive: false,
    candidateOptions: candidateResult.options,
    storageReadiness: getStorageCleanupReadiness({ execute: options.execute === true }),
    candidateSummary: {
      candidateCarCount: candidateResult.candidates.length,
      candidateMediaCount: mediaItems.length,
      skipped: candidateResult.skipped,
      reason: candidateResult.reason,
      schema: candidateResult.schema,
    },
    storageCleanup,
    databaseCleanup,
    candidates: candidateResult.candidates,
  };
}
