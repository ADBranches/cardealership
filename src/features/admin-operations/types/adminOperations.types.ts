export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | "rejected";

export type ListingReviewStatus = "pending" | "approved" | "rejected";

export type AdminDashboardStats = {
  totalCars: number;
  totalBookings: number;
  totalUsers: number;
  pendingBookings: number;
  pendingListings: number;
  generatedAt: string | null;
};

export type AdminBooking = {
  id: string;
  customerName: string;
  customerEmail?: string;
  vehicleId: string;
  vehicleName: string;
  bookingDate: string;
  timeSlot: string;
  status: BookingStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminListingReview = {
  id: string;
  make: string;
  model: string;
  year?: number;
  price?: number;
  mileage?: number;
  condition?: string;
  status: ListingReviewStatus;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminOperationErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION_FAILED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "CONTRACT_INVALID"
  | "OPERATION_FAILED";

export type AdminOperationResult<T> =
  | { success: true; data: T; message?: string }
  | { success: false; code: AdminOperationErrorCode; message: string; fieldErrors?: Record<string, string> };
