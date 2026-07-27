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
    databaseCleanup: {
      attempted: false,
      cleanedLinkCount: 0,
      reason: "Database media-link cleanup is intentionally not implemented in Phase 4.",
    },
    candidates: candidateResult.candidates,
  };
}
