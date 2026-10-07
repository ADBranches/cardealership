import type { AdminBooking, AdminDashboardStats, AdminListingReview, BookingStatus, ListingReviewStatus } from "../types";
import { isBookingStatus } from "../validation/bookingStatusTransitions";
import { isListingReviewStatus, normalizeRejectionReason } from "../validation/listingReviewValidation";

export type RawAdminRecord = Record<string, unknown>;

function stringValue(...values: unknown[]): string {
  const value = values.find((item) => item !== undefined && item !== null && String(item).trim() !== "");
  return value === undefined ? "" : String(value).trim();
}

function numberValue(...values: unknown[]): number {
  for (const value of values) {
    const parsed = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }
  return 0;
}

function optionalNumber(...values: unknown[]): number | undefined {
  const value = numberValue(...values);
  return value === 0 && !values.some((item) => item === 0 || item === "0") ? undefined : value;
}

function optionalString(...values: unknown[]): string | undefined {
  return stringValue(...values) || undefined;
}

function normalizedBookingStatus(value: unknown): BookingStatus | null {
  const status = stringValue(value).toLowerCase();
  if (status === "canceled") return "cancelled";
  return isBookingStatus(status) ? status : null;
}

function normalizedListingStatus(value: unknown): ListingReviewStatus | null {
  const status = stringValue(value).toLowerCase();
  return isListingReviewStatus(status) ? status : null;
}

export function normalizeAdminDashboardStats(payload: RawAdminRecord): AdminDashboardStats {
  const source = (payload.stats && typeof payload.stats === "object" ? payload.stats : payload.data && typeof payload.data === "object" ? payload.data : payload) as RawAdminRecord;
  return {
    totalCars: numberValue(source.totalCars, source.inventoryCount, source.total_cars, source.inventory_count),
    totalBookings: numberValue(source.totalBookings, source.total_bookings),
    totalUsers: numberValue(source.totalUsers, source.total_users),
    pendingBookings: numberValue(source.pendingBookings, source.pending_bookings),
    pendingListings: numberValue(source.pendingListings, source.pending_listings),
    generatedAt: optionalString(source.generatedAt, source.generated_at, payload.timestamp) ?? null,
  };
}

export function normalizeAdminBooking(raw: RawAdminRecord): AdminBooking | null {
  const id = stringValue(raw.id, raw._id, raw.bookingId, raw.booking_id);
  const status = normalizedBookingStatus(raw.status);
  if (!id || !status) return null;
  return {
    id,
    customerName: stringValue(raw.customerName, raw.user_name, raw.userName, raw.name) || "Customer",
    customerEmail: optionalString(raw.customerEmail, raw.user_email, raw.userEmail, raw.email),
    vehicleId: stringValue(raw.vehicleId, raw.car_id, raw.carId),
    vehicleName: stringValue(raw.vehicleName, raw.car_model, raw.carModel, [raw.make, raw.model].filter(Boolean).join(" ")) || "Vehicle",
    bookingDate: stringValue(raw.bookingDate, raw.booking_date, raw.date),
    timeSlot: stringValue(raw.timeSlot, raw.time_slot),
    status,
    createdAt: optionalString(raw.createdAt, raw.created_at),
    updatedAt: optionalString(raw.updatedAt, raw.updated_at),
  };
}

export function normalizeAdminBookings(payload: unknown): AdminBooking[] {
  const record = payload && typeof payload === "object" ? payload as RawAdminRecord : {};
  const items = Array.isArray(payload) ? payload : Array.isArray(record.bookings) ? record.bookings : Array.isArray(record.data) ? record.data : [];
  return items.map((item) => normalizeAdminBooking(item as RawAdminRecord)).filter((item): item is AdminBooking => item !== null);
}

export function normalizeAdminListingReview(raw: RawAdminRecord): AdminListingReview | null {
  const id = stringValue(raw.id, raw._id, raw.listingId, raw.listing_id);
  const status = normalizedListingStatus(raw.status);
  if (!id || !status) return null;
  const rejectionReason = normalizeRejectionReason(raw.rejectionReason ?? raw.rejection_reason);
  return {
    id,
    make: stringValue(raw.make, raw.brand),
    model: stringValue(raw.model, raw.name),
    year: optionalNumber(raw.year),
    price: optionalNumber(raw.price),
    mileage: optionalNumber(raw.mileage),
    condition: optionalString(raw.condition),
    status,
    rejectionReason: rejectionReason || undefined,
    createdAt: optionalString(raw.createdAt, raw.created_at),
    updatedAt: optionalString(raw.updatedAt, raw.updated_at),
  };
}

export function normalizeAdminListingReviews(payload: unknown): AdminListingReview[] {
  const record = payload && typeof payload === "object" ? payload as RawAdminRecord : {};
  const items = Array.isArray(payload) ? payload : Array.isArray(record.listings) ? record.listings : Array.isArray(record.data) ? record.data : [];
  return items.map((item) => normalizeAdminListingReview(item as RawAdminRecord)).filter((item): item is AdminListingReview => item !== null);
}
