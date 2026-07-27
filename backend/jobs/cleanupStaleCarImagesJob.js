import { cleanupStaleCarImages } from "../services/carImageCleanupService.js";

function readBooleanEnv(name, fallbackValue = false) {
  const value = process.env[name];

  if (value === undefined) {
    return fallbackValue;
  }

  return value === "true";
}

function readPositiveIntegerEnv(name, fallbackValue) {
  const parsedValue = Number(process.env[name]);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return fallbackValue;
  }

  return parsedValue;
}

function readStatusesEnv() {
  const value = process.env.CLEANUP_STATUSES || "Draft,Deleted";

  return value
    .split(",")
    .map((status) => status.trim())
    .filter(Boolean);
}

export function getCleanupJobConfig() {
  return {
    enabled: readBooleanEnv("CLEANUP_CRON_ENABLED", false),
    schedule: process.env.CLEANUP_CRON_SCHEDULE || "0 2 * * *",
    dryRun: readBooleanEnv("CLEANUP_DRY_RUN", true),
    olderThanDays: readPositiveIntegerEnv("CLEANUP_OLDER_THAN_DAYS", 30),
    limit: readPositiveIntegerEnv("CLEANUP_LIMIT", 100),
    statuses: readStatusesEnv(),
    provider: process.env.STORAGE_PROVIDER || process.env.IMAGE_STORAGE_PROVIDER || "pending",
  };
}

export async function runCleanupStaleCarImagesJob(overrides = {}) {
  const config = {
    ...getCleanupJobConfig(),
    ...overrides,
  };

  if (!config.enabled && overrides.force !== true) {
    return {
      skipped: true,
      reason: "Cleanup cron job is disabled. Set CLEANUP_CRON_ENABLED=true or call with force=true.",
      config: {
        enabled: config.enabled,
        schedule: config.schedule,
        dryRun: config.dryRun,
        olderThanDays: config.olderThanDays,
        limit: config.limit,
        statuses: config.statuses,
        provider: config.provider,
      },
    };
  }

  return cleanupStaleCarImages({
    dryRun: config.dryRun,
    olderThanDays: config.olderThanDays,
    statuses: config.statuses,
    limit: config.limit,
    provider: config.provider,
  });
}

export async function startCleanupStaleCarImagesJob() {
  const config = getCleanupJobConfig();

  if (!config.enabled) {
    return {
      started: false,
      skipped: true,
      reason: "Cleanup cron job is disabled by default.",
      config,
    };
  }

  return {
    started: false,
    skipped: true,
    reason: "Automatic in-process cron scheduling is not enabled in Phase 7. Use deployment scheduler or manual script until team approval.",
    config,
  };
}
