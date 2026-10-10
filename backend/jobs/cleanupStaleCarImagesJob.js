import { randomUUID } from "node:crypto";
import { cleanupStaleCarImages } from "../services/carImageCleanupService.js";

function readBooleanEnv(name, fallbackValue = false) {
  const value = process.env[name];
  return value === undefined ? fallbackValue : value === "true";
}

function readPositiveIntegerEnv(name, fallbackValue) {
  const parsedValue = Number(process.env[name]);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallbackValue;
}

function readStatusesEnv() {
  return (process.env.CLEANUP_STATUSES || "Draft,Deleted").split(",").map((status) => status.trim()).filter(Boolean);
}

export function getCleanupJobConfig() {
  return { enabled: readBooleanEnv("CLEANUP_CRON_ENABLED", false), schedule: process.env.CLEANUP_CRON_SCHEDULE || "0 2 * * *", dryRun: readBooleanEnv("CLEANUP_DRY_RUN", true), olderThanDays: readPositiveIntegerEnv("CLEANUP_OLDER_THAN_DAYS", 30), limit: readPositiveIntegerEnv("CLEANUP_LIMIT", 100), statuses: readStatusesEnv(), provider: process.env.STORAGE_PROVIDER || process.env.IMAGE_STORAGE_PROVIDER || "pending" };
}

function buildSkippedJobReport(config, reason) {
  const timestamp = new Date().toISOString();
  return { runId: randomUUID(), startedAt: timestamp, finishedAt: timestamp, dryRun: config.dryRun, olderThanDays: config.olderThanDays, statusesScanned: config.statuses, candidateCount: 0, mediaCount: 0, deletedCount: 0, skippedCount: 0, failureCount: 0, errors: [], skipped: true, reason, config: { enabled: config.enabled, schedule: config.schedule, dryRun: config.dryRun, olderThanDays: config.olderThanDays, limit: config.limit, statuses: config.statuses, provider: config.provider } };
}

export async function runCleanupStaleCarImagesJob(overrides = {}) {
  const config = { ...getCleanupJobConfig(), ...overrides };
  if (!config.enabled && overrides.force !== true) return buildSkippedJobReport(config, "Cleanup cron job is disabled. Set CLEANUP_CRON_ENABLED=true or call with force=true.");
  return cleanupStaleCarImages({ dryRun: config.dryRun, olderThanDays: config.olderThanDays, statuses: config.statuses, limit: config.limit, provider: config.provider });
}

export async function startCleanupStaleCarImagesJob() {
  const config = getCleanupJobConfig();
  if (!config.enabled) return { started: false, ...buildSkippedJobReport(config, "Cleanup cron job is disabled by default.") };
  return { started: false, ...buildSkippedJobReport(config, "Automatic in-process cron scheduling is not enabled. Use the deployment scheduler or manual script until team approval.") };
}
