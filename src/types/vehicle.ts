import type { VehicleStatus } from "../../src/app/lib/adminInventory";

export type AdminVehicle = {
  id: number;
  name: string;
  brand: string;
  type: string;
  year: number;
  price: number;
  condition: string;
  status?: VehicleStatus;
  image: string;
  specs: {
    power: string;
    engine: string;
    drive: string;
  };
};