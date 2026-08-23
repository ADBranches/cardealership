import { MAX_PRICE_RANGE } from "./formatUGX";

export type VehicleFilterQuery = {
  brand: string;
  year: string;
  maxPrice: number;
};

export function parseVehicleFilterQuery(search: string): VehicleFilterQuery {
  const params = new URLSearchParams(search);
  const rawPrice = Number(params.get("maxPrice"));
  return {
    brand: params.get("brand")?.trim() ?? "",
    year: params.get("year")?.trim() ?? "",
    maxPrice: Number.isFinite(rawPrice) && rawPrice >= 0 && rawPrice <= MAX_PRICE_RANGE
      ? rawPrice
      : MAX_PRICE_RANGE,
  };
}

export function buildVehicleFilterQuery(filters: VehicleFilterQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.brand.trim()) params.set("brand", filters.brand.trim());
  if (filters.year.trim()) params.set("year", filters.year.trim());
  if (filters.maxPrice < MAX_PRICE_RANGE) params.set("maxPrice", String(filters.maxPrice));
  return params;}
