import type { VehicleStatus } from "../../src/app/lib/adminInventory";
import type { ListingReviewStatus } from "../features/admin-operations/types";

export type AdminVehicle = {
  id: number;
  name: string;
  brand: string;
  type: string;
  year: number;
  price: number;
  condition: string;
  status?: VehicleStatus;
  reviewStatus?: ListingReviewStatus;
  image: string;
  specs: {
    power: string;
    engine: string;
    drive: string;
  };
};