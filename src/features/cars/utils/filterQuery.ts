import { MAX_PRICE_RANGE } from "./formatUGX";

export type VehicleFilterQuery = {
  make: string;
  year: string;
  maxPrice: number;
};

export function parseVehicleFilterQuery(search: string): VehicleFilterQuery {
  const params = new URLSearchParams(search);

  const maxPriceParam = params.get("maxPrice");

  let maxPrice = MAX_PRICE_RANGE;

  if (maxPriceParam !== null && maxPriceParam.trim() !== "") {
    const parsedPrice = Number(maxPriceParam);

    if (
      Number.isFinite(parsedPrice) &&
      parsedPrice >= 0 &&
      parsedPrice <= MAX_PRICE_RANGE
    ) {
      maxPrice = parsedPrice;
    }
  }

  return {
    make: params.get("make")?.trim() ?? "",
    year: params.get("year")?.trim() ?? "",
    maxPrice,
  };
}

export function buildVehicleFilterQuery(
  filters: VehicleFilterQuery,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.make.trim()) {
    params.set("make", filters.make.trim());
  }

  if (filters.year.trim()) {
    params.set("year", filters.year.trim());
  }

  if (filters.maxPrice < MAX_PRICE_RANGE) {
    params.set("maxPrice", String(filters.maxPrice));
  }

  return params;
}
