/**
 * Sprint 4 — Car image cleanup contract.
 *
 * This file defines the cleanup eligibility rules only.
 * It does not query the database.
 * It does not delete database records.
 * It does not delete Cloudinary/storage assets.
 */

export const CLEANUP_ELIGIBLE_STATUSES = [
  "Draft",
  "Deleted",
  "draft",
  "deleted",
];

export const CLEANUP_PROTECTED_STATUSES = [
  "Available",
  "available",
  "Sold",
  "sold",
  "Pending",
  "pending",
  "Approved",
  "approved",
  "Published",
  "published",
  "Active",
  "active",
];

export const CLEANUP_DEFAULT_OLDER_THAN_DAYS = 30;

export const CLEANUP_TIMESTAMP_FIELD_FALLBACK = [
  "deleted_at",
  "drafted_at",
  "updated_at",
  "created_at",
];

export const CLEANUP_MEDIA_TABLE = "car_images";

export const CLEANUP_MEDIA_FIELDS = {
  id: "id",
  carId: "car_id",
  imageUrl: "image_url",
  imageType: "image_type",
  isPrimary: "is_primary",
};

export const DEFAULT_CAR_IMAGE_CLEANUP_OPTIONS = {
  dryRun: true,
  olderThanDays: CLEANUP_DEFAULT_OLDER_THAN_DAYS,
  statuses: CLEANUP_ELIGIBLE_STATUSES,
  limit: 100,
};

export function normalizeStatus(status) {
  if (typeof status !== "string") {
    return "";
  }

  return status.trim();
}

export function isCleanupEligibleStatus(status) {
  const normalizedStatus = normalizeStatus(status);

  return CLEANUP_ELIGIBLE_STATUSES.includes(normalizedStatus);
}

export function isCleanupProtectedStatus(status) {
  const normalizedStatus = normalizeStatus(status);

  return CLEANUP_PROTECTED_STATUSES.includes(normalizedStatus);
}

export function getCandidateTimestampField(listing = {}) {
  for (const field of CLEANUP_TIMESTAMP_FIELD_FALLBACK) {
    if (listing[field]) {
      return field;
    }
  }

  return null;
}

export function getCandidateTimestampValue(listing = {}) {
  const field = getCandidateTimestampField(listing);

  if (!field) {
    return null;
  }

  return listing[field];
}

export function isOlderThanDays(value, days = CLEANUP_DEFAULT_OLDER_THAN_DAYS, now = new Date()) {
  if (!value) {
    return false;
  }

  const candidateDate = new Date(value);

  if (Number.isNaN(candidateDate.getTime())) {
    return false;
  }

  const ageInMilliseconds = now.getTime() - candidateDate.getTime();
  const thresholdInMilliseconds = days * 24 * 60 * 60 * 1000;

  return ageInMilliseconds > thresholdInMilliseconds;
}

export function hasCleanupMediaLinks(listing = {}) {
  if (Array.isArray(listing.images) && listing.images.length > 0) {
    return true;
  }

  if (Array.isArray(listing.media) && listing.media.length > 0) {
    return true;
  }

  if (typeof listing.image_url === "string" && listing.image_url.trim() !== "") {
    return true;
  }

  return false;
}

export function describeCarImageCleanupContract() {
  return {
    eligibleStatuses: CLEANUP_ELIGIBLE_STATUSES,
    protectedStatuses: CLEANUP_PROTECTED_STATUSES,
    olderThanDays: CLEANUP_DEFAULT_OLDER_THAN_DAYS,
    timestampFallback: CLEANUP_TIMESTAMP_FIELD_FALLBACK,
    mediaTable: CLEANUP_MEDIA_TABLE,
    mediaFields: CLEANUP_MEDIA_FIELDS,
    defaultOptions: DEFAULT_CAR_IMAGE_CLEANUP_OPTIONS,
    destructiveByDefault: false,
  };
}
