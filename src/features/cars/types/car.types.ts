export type VehicleCategory = "luxury" | "sport" | string;

export type VehicleCondition = "New" | "Used";

export type VehicleDrive = "4WD" | "AWD" | "RWD" | string;

export type VehicleStatus =
  | "Available"
  | "Pending Test Drive"
  | "Reserved"
  | "Sold";

export interface VehicleSpecs {
  power: string;
  engine: string;
  drive: VehicleDrive;
}

export interface VehicleImage {
  id?: number;
  url: string;
  type?: string;
}

export interface Vehicle {
  id: number;

  vin?: string | null;

  make: string;
  model?: string | null;

  name: string;
  type: string;
  category: VehicleCategory;

  year: number;
  price: number;

  mileage?: number | null;
  color?: string | null;

  condition: VehicleCondition;
  status: VehicleStatus;

  description?: string | null;

  image: string;
  images?: VehicleImage[];

  specs: VehicleSpecs;
}

export interface VehicleFilterState {
  searchBrand: string;
  searchYear: string;
  priceRange: number;
}

export type InventoryTab = "all" | "luxury" | "sport" | "4x4";
