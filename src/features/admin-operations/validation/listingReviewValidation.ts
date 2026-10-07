import type { ListingReviewStatus } from "../types";

export const LISTING_REVIEW_STATUSES: readonly ListingReviewStatus[] = ["pending", "approved", "rejected"];
export const MIN_REJECTION_REASON_LENGTH = 5;
export const MAX_REJECTION_REASON_LENGTH = 500;

export function isListingReviewStatus(value: unknown): value is ListingReviewStatus {
  return typeof value === "string" && LISTING_REVIEW_STATUSES.includes(value as ListingReviewStatus);
}

export function normalizeRejectionReason(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validateRejectionReason(value: unknown): { valid: true; value: string } | { valid: false; message: string } {
  const reason = normalizeRejectionReason(value);
  if (reason.length < MIN_REJECTION_REASON_LENGTH) {
    return { valid: false, message: `Rejection reason must contain at least ${MIN_REJECTION_REASON_LENGTH} characters.` };
  }
  if (reason.length > MAX_REJECTION_REASON_LENGTH) {
    return { valid: false, message: `Rejection reason must contain no more than ${MAX_REJECTION_REASON_LENGTH} characters.` };
  }
  return { valid: true, value: reason };
}
