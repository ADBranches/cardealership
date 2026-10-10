export type AvailabilityErrorCode =
  | "INVALID_REQUEST"
  | "UNAUTHORIZED"
  | "AVAILABILITY_FAILED"
  | "ABORTED";

export type AvailabilitySlot = {
  time: string;
  available: boolean;
};

export type AvailabilitySuccess = {
  success: true;
  vehicleId: string;
  date: string;
  slots: AvailabilitySlot[];
  availableSlots: string[];
  reservedSlots: string[];
  mock: boolean;
  message: string;
};

export type AvailabilityResult =
  | AvailabilitySuccess
  | {
      success: false;
      code: AvailabilityErrorCode;
      message: string;
    };

export type AvailabilityState = {
  status: "idle" | "loading" | "ready" | "error";
  result: AvailabilityResult | null;
};
