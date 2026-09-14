import type { BookingStatus, DispatchBooking, DispatchMutationResult, DispatchService } from "../types";
import { canTransitionBooking, isBookingStatus } from "../validation/bookingTransitions";

export type DispatchApiOptions = { mockMode?: boolean; isProduction?: boolean };
export type RawDispatchBooking = Record<string, unknown>;

export function isDispatchMockMode(value = import.meta.env?.VITE_ADMIN_DISPATCH_MOCK_MODE, isProduction = import.meta.env?.PROD) { return !isProduction && value === "true"; }

export function normalizeDispatchBooking(raw: RawDispatchBooking): DispatchBooking | null {
  const id = String(raw.id ?? raw._id ?? "").trim();
  const statusValue = String(raw.status ?? "pending").toLowerCase();
  if (!id || !isBookingStatus(statusValue)) return null;
  return {
    id,
    customerName: String(raw.customerName ?? raw.user_name ?? raw.userName ?? "Customer").trim(),
    customerEmail: String(raw.customerEmail ?? raw.user_email ?? raw.userEmail ?? "").trim() || undefined,
    vehicleId: String(raw.vehicleId ?? raw.car_id ?? raw.carId ?? "").trim(),
    vehicleName: String(raw.vehicleName ?? raw.car_model ?? raw.carModel ?? [raw.make, raw.model].filter(Boolean).join(" ") ?? "Vehicle").trim() || "Vehicle",
    bookingDate: String(raw.bookingDate ?? raw.booking_date ?? raw.date ?? "").trim(),
    timeSlot: String(raw.timeSlot ?? raw.time_slot ?? "").trim(),
    status: statusValue,
    updatedAt: String(raw.updatedAt ?? raw.updated_at ?? "").trim() || undefined,
  };
}

const seed: DispatchBooking = { id: "synthetic-booking-001", customerName: "Synthetic Customer", vehicleId: "synthetic-car-001", vehicleName: "Synthetic Vehicle", bookingDate: "2026-09-15", timeSlot: "10:00", status: "pending" };
class IsolatedDispatchService implements DispatchService {
  private bookings = [{ ...seed }];
  constructor(private options: DispatchApiOptions) {}
  private enabled() { return this.options.mockMode ?? isDispatchMockMode(undefined, this.options.isProduction ?? import.meta.env?.PROD); }
  async listBookings(token: string) {
    if (!token.trim()) return { success: false as const, code: "UNAUTHORIZED" as const, message: "Authentication is required." };
    if (!this.enabled()) return { success: false as const, code: "CONTRACT_UNAVAILABLE" as const, message: "Live dispatch status-update contract is not confirmed." };
    return { success: true as const, bookings: this.bookings.map((booking) => ({ ...booking })), mock: true };
  }
  async updateBookingStatus(token: string, bookingId: string, status: BookingStatus): Promise<DispatchMutationResult> {
    if (!token.trim()) return { success: false, code: "UNAUTHORIZED", message: "Authentication is required.", bookingId };
    if (!this.enabled()) return { success: false, code: "CONTRACT_UNAVAILABLE", message: "Live dispatch status-update contract is not confirmed.", bookingId };
    const index = this.bookings.findIndex((booking) => booking.id === bookingId);
    if (index < 0 || !canTransitionBooking(this.bookings[index].status, status)) return { success: false, code: "INVALID_TRANSITION", message: "Transition is unavailable.", bookingId };
    this.bookings[index] = { ...this.bookings[index], status, updatedAt: new Date().toISOString() };
    return { success: true, booking: { ...this.bookings[index] }, mock: true };
  }
}
export function createDispatchService(options: DispatchApiOptions = {}): DispatchService {
  if ((options.isProduction ?? import.meta.env?.PROD) && options.mockMode) throw new Error("Mock dispatch service is disabled in production.");
  return new IsolatedDispatchService(options);
}
