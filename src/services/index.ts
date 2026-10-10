export type { TestDriveBookingPayload } from "@/features/test-drive/types";

export {
  getAuthToken,
} from "@/features/auth/services";

export {
  submitTestDriveBooking as submitTestDriveBookingDraft,
  TEST_DRIVE_BOOKING_ENDPOINT,
} from "@/features/test-drive/services";
