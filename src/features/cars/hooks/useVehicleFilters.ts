import { useMemo, useState } from "react";
import { MAX_PRICE_RANGE } from "../utils/formatUGX";
import type { InventoryTab, Vehicle } from "../types";

export function useVehicleFilters(vehicles: Vehicle[]) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceRange, setPriceRange] = useState(MAX_PRICE_RANGE);
  const [searchBrand, setSearchBrand] = useState("");
  const [searchYear, setSearchYear] = useState("");

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesBrand = searchBrand
        ? vehicle.brand.toLowerCase().includes(searchBrand.toLowerCase())
        : true;
      const matchesYear = searchYear ? vehicle.year.toString().includes(searchYear) : true;
      const matchesPrice = vehicle.price <= priceRange;
      return matchesBrand && matchesYear && matchesPrice;
    });
  }, [vehicles, searchBrand, searchYear, priceRange]);

  const resetFilters = () => {
    setSearchBrand("");
    setSearchYear("");
    setPriceRange(MAX_PRICE_RANGE);
  };

  const filterByTab = (tab: InventoryTab, list: Vehicle[] = filteredVehicles) => {
    if (tab === "all") return list;
    if (tab === "4x4") {
      return list.filter(
        (vehicle) => vehicle.specs.drive === "4WD" || vehicle.specs.drive === "AWD"
      );
    }
    return list.filter((vehicle) => vehicle.category === tab);
  };

  return {
    showAdvanced,
    setShowAdvanced,
    priceRange,
    setPriceRange,
    searchBrand,
    setSearchBrand,
    searchYear,
    setSearchYear,
    filteredVehicles,
    resetFilters,
    filterByTab,
  };
}
