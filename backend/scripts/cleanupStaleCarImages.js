import dotenv from "dotenv";

for (const envPath of ["backend/.env.development", ".env.development", "backend/.env", ".env"]) dotenv.config({ path: envPath });

function readFlagValue(flagName, fallbackValue) {
  const prefix = `${flagName}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallbackValue;
}

function parsePositiveInteger(value, fallbackValue) {
  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallbackValue;
}

function parseStatuses(value) {
  return (value || "Draft,Deleted").split(",").map((status) => status.trim()).filter(Boolean);
}

function parseOptions() {
  const execute = process.argv.includes("--execute");
  return { dryRun: !execute || process.argv.includes("--dry-run"), execute, olderThanDays: parsePositiveInteger(readFlagValue("--older-than-days", "30"), 30), limit: parsePositiveInteger(readFlagValue("--limit", "100"), 100), statuses: parseStatuses(readFlagValue("--statuses", "Draft,Deleted")), provider: readFlagValue("--provider", undefined), cleanDatabaseLinks: process.argv.includes("--clean-db-links"), allowDatabaseCleanupWhenStorageSkipped: process.argv.includes("--allow-db-cleanup-when-storage-skipped") };
}

function sanitizeError(error) {
  if (!error) return null;
  return { code: error.code || "CLEANUP_FAILED", message: "The cleanup run could not be completed. Review server-side database and provider configuration." };
}

function buildReport(result, error = null, options = {}) {
  const safeError = sanitizeError(error);
  return { runId: result?.runId || null, startedAt: result?.startedAt || new Date().toISOString(), finishedAt: result?.finishedAt || new Date().toISOString(), dryRun: result?.dryRun ?? options.dryRun ?? true, olderThanDays: result?.olderThanDays || options.olderThanDays || 30, statusesScanned: result?.statusesScanned || options.statuses || ["Draft", "Deleted"], candidateCount: result?.candidateCount || 0, mediaCount: result?.mediaCount || 0, deletedCount: result?.deletedCount || 0, skippedCount: result?.skippedCount || 0, failureCount: result?.failureCount ?? (safeError ? 1 : 0), errors: result?.errors || (safeError ? [safeError] : []), databaseCleanedCount: result?.databaseCleanup?.cleanedLinkCount || 0, destructive: result?.destructive === true };
}

async function main() {
  const options = parseOptions();
  const { cleanupStaleCarImages } = await import("../services/carImageCleanupService.js");
  try {
    console.log(JSON.stringify(buildReport(await cleanupStaleCarImages(options), null, options), null, 2));
  } catch (error) {
    console.log(JSON.stringify(buildReport(null, error, options), null, 2));
    process.exitCode = options.dryRun ? 0 : 1;
  }
}

main();
