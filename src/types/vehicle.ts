import type { VehicleStatus } from "../../src/app/lib/adminInventory";

export type AdminVehicle = {
  id: number;
  vin?: string | null;
  make: string;
  model?: string | null;
  name: string;
  type: string;
  category?: string;
  year: number;
  price: number;
  mileage?: number | null;
  color?: string | null;
  condition: string;
  status?: VehicleStatus;
  description?: string | null;
  image: string;
  specs: {
    power: string;
    engine: string;
    drive: string;
  };
};
