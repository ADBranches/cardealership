export type VehicleStatus = "Available" | "Pending Test Drive" | "Sold";

export const VEHICLE_STATUSES: VehicleStatus[] = [
  "Available",
  "Pending Test Drive",
  "Sold",
];

export type AdminVehicle = {
  id: number | string;
  make?: string;
  model?: string;
  name?: string;
  brand?: string;
  type?: string;
  year: number;
  price: number;
  mileage?: number;
  status: VehicleStatus;
  condition?: string;
  image?: string;
  specs?: {
    power?: string;
    engine?: string;
    drive?: string;
  };
};

export type AddCarFormValues = {
  make: string;
  model: string;
  price: string;
  year: string;
  mileage: string;
  imageFile: File | null;
};

export type AddCarPayload = {
  make: string;
  model: string;
  price: number;
  year: number;
  mileage: number;
  imageUrl?: string;
  status: VehicleStatus;
};

export type EditVehicleFormValues = {
  price: string;
  condition: string;
  status: VehicleStatus;
};

export type EditVehiclePayload = {
  id: number | string;
  price: number;
  condition?: string;
  status: VehicleStatus;
};

export type DeleteVehicleTarget = {
  id: number | string;
  name?: string;
  make?: string;
  model?: string;
  brand?: string;
  year?: number;
  price?: number;
};

export type PaginatedCarsResponse = {
  cars: AdminVehicle[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
