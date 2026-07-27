import dotenv from "dotenv";

for (const envPath of ["backend/.env.development", ".env.development", "backend/.env", ".env"]) {
  dotenv.config({ path: envPath });
}

function readFlagValue(flagName, fallbackValue) {
  const prefix = `${flagName}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));

  if (!match) {
    return fallbackValue;
  }

  return match.slice(prefix.length);
}

function parsePositiveInteger(value, fallbackValue) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return fallbackValue;
  }

  return parsedValue;
}

function parseStatuses(value) {
  if (!value) {
    return ["Draft", "Deleted"];
  }

  return value
    .split(",")
    .map((status) => status.trim())
    .filter(Boolean);
}

function parseOptions() {
  const execute = process.argv.includes("--execute");
  const dryRun = !execute || process.argv.includes("--dry-run");

  return {
    dryRun,
    execute,
    olderThanDays: parsePositiveInteger(readFlagValue("--older-than-days", "30"), 30),
    limit: parsePositiveInteger(readFlagValue("--limit", "100"), 100),
    statuses: parseStatuses(readFlagValue("--statuses", "Draft,Deleted")),
    provider: readFlagValue("--provider", undefined),
    cleanDatabaseLinks: process.argv.includes("--clean-db-links"),
    allowDatabaseCleanupWhenStorageSkipped: process.argv.includes("--allow-db-cleanup-when-storage-skipped"),
  };
}

function buildReport(result, error = null) {
  const databaseResults = result?.databaseCleanup?.results || [];
  const storageCleanup = result?.storageCleanup || {};

  return {
    cleanupMode: result?.dryRun === false ? "execute" : "dry-run",
    olderThanDays: result?.candidateOptions?.olderThanDays || 30,
    statusesScanned: result?.candidateOptions?.statuses || ["Draft", "Deleted"],
    staleListingsFound: result?.candidateSummary?.candidateCarCount || 0,
    mediaLinksFound: result?.candidateSummary?.candidateMediaCount || 0,
    mediaLinksSkipped: storageCleanup.skippedCount || 0,
    mediaLinksCleaned: result?.databaseCleanup?.cleanedLinkCount || 0,
    storageDeletedCount: storageCleanup.deletedCount || 0,
    databaseCleanupAttempted: result?.databaseCleanup?.attempted === true,
    errorsEncountered: error ? 1 : 0,
    error: error
      ? {
          name: error.name,
          message: error.message,
          code: error.code,
        }
      : null,
    startedAt: result?.startedAt || new Date().toISOString(),
    finishedAt: result?.finishedAt || new Date().toISOString(),
    dryRunSafe: result?.dryRun !== false,
    destructive: result?.destructive === true,
    databaseResultCount: databaseResults.length,
  };
}

async function main() {
  const options = parseOptions();
  const { cleanupStaleCarImages } = await import("../services/carImageCleanupService.js");

  try {
    const result = await cleanupStaleCarImages(options);
    console.log(JSON.stringify(buildReport(result), null, 2));
  } catch (error) {
    console.log(JSON.stringify(buildReport(null, error), null, 2));
    process.exitCode = options.dryRun ? 0 : 1;
  }
}

main();
