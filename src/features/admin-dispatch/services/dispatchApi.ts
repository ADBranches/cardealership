import type { BookingStatus, DispatchBooking, DispatchMutationResult, DispatchService } from "../types";
export type DispatchApiOptions = { mockMode?: boolean; isProduction?: boolean };
export function isDispatchMockMode(value = import.meta.env.VITE_ADMIN_DISPATCH_MOCK_MODE, isProduction = import.meta.env.PROD) { return !isProduction && value === "true"; }
const seed: DispatchBooking = { id: "synthetic-booking-001", customerName: "Synthetic Customer", vehicleId: "synthetic-car-001", vehicleName: "Synthetic Vehicle", bookingDate: "2026-09-08", timeSlot: "10:00", status: "pending" };
class MockDispatchService implements DispatchService {
  private booking = { ...seed };
  constructor(private options: DispatchApiOptions) {}
  private enabled() { return this.options.mockMode ?? isDispatchMockMode(undefined, this.options.isProduction ?? import.meta.env.PROD); }
  async listBookings(token: string) {
    if (!token.trim()) return { success: false as const, code: "UNAUTHORIZED" as const, message: "Authentication is required." };
    if (!this.enabled()) return { success: false as const, code: "CONTRACT_UNAVAILABLE" as const, message: "Live dispatch integration is not confirmed." };
    return { success: true as const, bookings: [{ ...this.booking }], mock: true };
  }
  async updateBookingStatus(token: string, bookingId: string, status: BookingStatus): Promise<DispatchMutationResult> {
    if (!token.trim()) return { success: false, code: "UNAUTHORIZED", message: "Authentication is required.", bookingId };
    if (!this.enabled()) return { success: false, code: "CONTRACT_UNAVAILABLE", message: "Live dispatch integration is not confirmed.", bookingId };
    const allowed = this.booking.status === "pending" && (status === "confirmed" || status === "cancelled");
    if (bookingId !== this.booking.id || !allowed) return { success: false, code: "INVALID_TRANSITION", message: "Transition is unavailable.", bookingId };
    this.booking = { ...this.booking, status, updatedAt: new Date().toISOString() };
    return { success: true, booking: { ...this.booking }, mock: true };
  }
}
export function createDispatchService(options: DispatchApiOptions = {}): DispatchService {
  if ((options.isProduction ?? import.meta.env.PROD) && options.mockMode) throw new Error("Mock dispatch service is disabled in production.");
  return new MockDispatchService(options);
}
