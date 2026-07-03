import { MOCK_VEHICLES } from "../data/mockVehicles";
import type { Vehicle } from "../types";

export async function getCars(): Promise<Vehicle[]> {
  return Promise.resolve(MOCK_VEHICLES);
}

export async function getCarById(id: number): Promise<Vehicle | undefined> {
  const vehicles = await getCars();
  return vehicles.find((vehicle) => vehicle.id === id);
}
