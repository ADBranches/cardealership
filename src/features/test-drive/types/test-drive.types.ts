export type TestDriveBookingPayload = {
  vehicleId: string;
  vehicleName?: string;
  date: string;
  time: string;
  phone: string;
  notes?: string;
};

export type TestDriveVehicleOption = {
  id: number;
  name: string;
  make: string;
  model?: string | null;
  year: number;
};
