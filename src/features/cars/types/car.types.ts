export type VehicleCategory = "luxury" | "sport";
export type VehicleCondition = "New" | "Used";
export type VehicleDrive = "4WD" | "AWD" | "RWD";

export interface VehicleSpecs {
  power: string;
  engine: string;
  drive: VehicleDrive;
}

export interface Vehicle {
  id: number;
  name: string;
  brand: string;
  type: string;
  year: number;
  price: number;
  image: string;
  specs: VehicleSpecs;
  category: VehicleCategory;
  condition: VehicleCondition;
}

export interface VehicleFilterState {
  searchBrand: string;
  searchYear: string;
  priceRange: number;
}

export type InventoryTab = "all" | VehicleCategory | "4x4";
