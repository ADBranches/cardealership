import db from "../config/db.js";
import {
  CLEANUP_DEFAULT_OLDER_THAN_DAYS,
  CLEANUP_ELIGIBLE_STATUSES,
  CLEANUP_TIMESTAMP_FIELD_FALLBACK,
  DEFAULT_CAR_IMAGE_CLEANUP_OPTIONS,
} from "../utils/carImageCleanupContract.js";

const CARS_TABLE = "cars";
const MEDIA_TABLE = "car_images";

function normalizePositiveInteger(value, fallback) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
}

function normalizeStatuses(statuses) {
  if (!Array.isArray(statuses) || statuses.length === 0) {
    return CLEANUP_ELIGIBLE_STATUSES;
  }

  return statuses
    .filter((status) => typeof status === "string")
    .map((status) => status.trim())
    .filter(Boolean);
}

function buildCleanupOptions(options = {}) {
  return {
    ...DEFAULT_CAR_IMAGE_CLEANUP_OPTIONS,
    ...options,
    olderThanDays: normalizePositiveInteger(
      options.olderThanDays,
      CLEANUP_DEFAULT_OLDER_THAN_DAYS
    ),
    limit: normalizePositiveInteger(
      options.limit,
      DEFAULT_CAR_IMAGE_CLEANUP_OPTIONS.limit
    ),
    statuses: normalizeStatuses(options.statuses),
  };
}

async function getTableColumns(tableName) {
  const result = await db.query(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position;
    `,
    [tableName]
  );

  return new Set(result.rows.map((row) => row.column_name));
}

function chooseTimestampField(carColumns) {
  return CLEANUP_TIMESTAMP_FIELD_FALLBACK.find((field) => carColumns.has(field)) || null;
}

function getOptionalMediaSelect(mediaColumns) {
  return {
    imageId: mediaColumns.has("id") ? "ci.id" : "NULL",
    imageType: mediaColumns.has("image_type") ? "ci.image_type" : "NULL",
    isPrimary: mediaColumns.has("is_primary") ? "ci.is_primary" : "NULL",
  };
}

function mapCandidateRows(rows = []) {
  const candidatesByCarId = new Map();

  for (const row of rows) {
    const carId = row.car_id;

    if (!candidatesByCarId.has(carId)) {
      candidatesByCarId.set(carId, {
        carId,
        status: row.status,
        candidateTimestamp: row.candidate_timestamp,
        media: [],
      });
    }

    if (row.image_url) {
      candidatesByCarId.get(carId).media.push({
        imageId: row.image_id,
        imageUrl: row.image_url,
        imageType: row.image_type,
        isPrimary: row.is_primary,
      });
    }
  }

  return Array.from(candidatesByCarId.values());
}

function buildSkippedResult(options, reason, schema = {}) {
  return {
    options,
    candidates: [],
    rowCount: 0,
    destructive: false,
    skipped: true,
    reason,
    schema,
  };
}

export async function findStaleCarMediaCandidates(options = {}) {
  const cleanupOptions = buildCleanupOptions(options);
  const carColumns = await getTableColumns(CARS_TABLE);
  const mediaColumns = await getTableColumns(MEDIA_TABLE);
  const timestampField = chooseTimestampField(carColumns);

  const schema = {
    carsTable: CARS_TABLE,
    mediaTable: MEDIA_TABLE,
    timestampField,
    hasCarStatus: carColumns.has("status"),
    hasMediaCarId: mediaColumns.has("car_id"),
    hasMediaUrl: mediaColumns.has("image_url"),
  };

  if (!carColumns.has("id")) {
    return buildSkippedResult(cleanupOptions, "cars.id column is required for cleanup candidate selection.", schema);
  }

  if (!carColumns.has("status")) {
    return buildSkippedResult(cleanupOptions, "cars.status column is required for cleanup candidate selection.", schema);
  }

  if (!timestampField) {
    return buildSkippedResult(cleanupOptions, "No supported cars timestamp column was found for the 30-day cleanup check.", schema);
  }

  if (!mediaColumns.has("car_id") || !mediaColumns.has("image_url")) {
    return buildSkippedResult(cleanupOptions, "car_images.car_id and car_images.image_url are required for media candidate selection.", schema);
  }

  const mediaSelect = getOptionalMediaSelect(mediaColumns);
  const query = `
    SELECT
      c.id AS car_id,
      c.status,
      c.${timestampField} AS candidate_timestamp,
      ${mediaSelect.imageId} AS image_id,
      ci.image_url,
      ${mediaSelect.imageType} AS image_type,
      ${mediaSelect.isPrimary} AS is_primary
    FROM ${CARS_TABLE} c
    INNER JOIN ${MEDIA_TABLE} ci ON ci.car_id = c.id
    WHERE c.status = ANY($1)
      AND c.${timestampField} < NOW() - ($2::int * INTERVAL '1 day')
    ORDER BY c.${timestampField} ASC
    LIMIT $3;
  `;

  const result = await db.query(query, [
    cleanupOptions.statuses,
    cleanupOptions.olderThanDays,
    cleanupOptions.limit,
  ]);

  return {
    options: cleanupOptions,
    candidates: mapCandidateRows(result.rows),
    rowCount: result.rowCount,
    destructive: false,
    skipped: false,
    schema,
  };
}

export async function getStaleCarMediaSummary(options = {}) {
  const result = await findStaleCarMediaCandidates(options);
  const mediaCount = result.candidates.reduce(
    (total, candidate) => total + candidate.media.length,
    0
  );

  return {
    options: result.options,
    candidateCarCount: result.candidates.length,
    candidateMediaCount: mediaCount,
    destructive: false,
    skipped: result.skipped,
    reason: result.reason,
    schema: result.schema,
    candidates: result.candidates,
  };
}
