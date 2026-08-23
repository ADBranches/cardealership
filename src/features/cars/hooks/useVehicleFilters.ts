import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { buildVehicleFilterQuery, parseVehicleFilterQuery } from "../utils/filterQuery";
import type { InventoryTab, Vehicle } from "../types";

export function useVehicleFilters(vehicles: Vehicle[]) {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFilters = useMemo(
    () => parseVehicleFilterQuery(searchParams.toString()),
    [searchParams],
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilters = (next: Partial<typeof queryFilters>) => {
    setSearchParams(buildVehicleFilterQuery({ ...queryFilters, ...next }), { replace: true });
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesBrand = queryFilters.brand
        ? vehicle.brand.toLowerCase().includes(queryFilters.brand.toLowerCase())
        : true;
      const matchesYear = queryFilters.year
        ? vehicle.year.toString().includes(queryFilters.year)
        : true;
      return matchesBrand && matchesYear && vehicle.price <= queryFilters.maxPrice;
    });
  }, [vehicles, queryFilters]);

  const resetFilters = () => setSearchParams({}, { replace: true });
  const filterByTab = (tab: InventoryTab, list: Vehicle[] = filteredVehicles) => {
    if (tab === "all") return list;
    if (tab === "4x4") {
      return list.filter(
        (vehicle) => vehicle.specs.drive === "4WD" || vehicle.specs.drive === "AWD",
      );
    }
    return list.filter((vehicle) => vehicle.category === tab);
  };

  return {
    showAdvanced,
    setShowAdvanced,
    priceRange: queryFilters.maxPrice,
    setPriceRange: (value: number) => updateFilters({ maxPrice: value }),
    searchBrand: queryFilters.brand,
    setSearchBrand: (value: string) => updateFilters({ brand: value }),
    searchYear: queryFilters.year,
    setSearchYear: (value: string) => updateFilters({ year: value }),
    filteredVehicles,
    resetFilters,
    filterByTab,
  };
}
