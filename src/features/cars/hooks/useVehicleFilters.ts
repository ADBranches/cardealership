import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  buildVehicleFilterQuery,
  parseVehicleFilterQuery,
} from "../utils/filterQuery";
import type { InventoryTab, Vehicle } from "../types";

export function useVehicleFilters(vehicles: Vehicle[]) {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryFilters = useMemo(
    () => parseVehicleFilterQuery(searchParams.toString()),
    [searchParams],
  );

  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilters = (next: Partial<typeof queryFilters>) => {
    setSearchParams(
      buildVehicleFilterQuery({
        ...queryFilters,
        ...next,
      }),
      { replace: true },
    );
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const searchValue = queryFilters.make.trim().toLowerCase();

      const matchesMake = searchValue
        ? vehicle.make.toLowerCase().includes(searchValue) ||
          (vehicle.model ?? "").toLowerCase().includes(searchValue) ||
          vehicle.name.toLowerCase().includes(searchValue)
        : true;

      const matchesYear = queryFilters.year
        ? vehicle.year.toString().includes(queryFilters.year)
        : true;

      const matchesPrice = vehicle.price <= queryFilters.maxPrice;

      return matchesMake && matchesYear && matchesPrice;
    });
  }, [vehicles, queryFilters]);

  const resetFilters = () => setSearchParams({}, { replace: true });

  const filterByTab = (
    tab: InventoryTab,
    list: Vehicle[] = filteredVehicles,
  ) => {
    if (tab === "all") {
      return list;
    }

    if (tab === "4x4") {
      return list.filter((vehicle) => {
        const drive = vehicle.specs.drive.trim().toUpperCase();

        return drive === "4WD" || drive === "AWD";
      });
    }

    return list.filter((vehicle) => vehicle.category === tab);
  };

  return {
    showAdvanced,
    setShowAdvanced,

    priceRange: queryFilters.maxPrice,

    setPriceRange: (value: number) =>
      updateFilters({
        maxPrice: value,
      }),

    searchMake: queryFilters.make,

    setSearchMake: (value: string) =>
      updateFilters({
        make: value,
      }),

    searchYear: queryFilters.year,

    setSearchYear: (value: string) =>
      updateFilters({
        year: value,
      }),

    filteredVehicles,
    resetFilters,
    filterByTab,
  };
}
