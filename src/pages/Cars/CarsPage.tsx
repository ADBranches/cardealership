import { useCars, useVehicleFilters } from "@/features/cars/hooks";
import {
  VehicleInventorySection,
  VehicleSearchSection,
} from "@/features/cars/components";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";

export function CarsPage() {
  const { vehicles, loading, error } = useCars();
  const filters = useVehicleFilters(vehicles);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-6 text-center mt-20">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-20">
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">VEHICLE INVENTORY</h1>
          <p className="text-muted-foreground text-lg">
            Browse our full showroom stock with advanced filters.
          </p>
        </div>
      </section>
      <VehicleSearchSection
        searchBrand={filters.searchBrand}
        setSearchBrand={filters.setSearchBrand}
        searchYear={filters.searchYear}
        setSearchYear={filters.setSearchYear}
        priceRange={filters.priceRange}
        setPriceRange={filters.setPriceRange}
        showAdvanced={filters.showAdvanced}
        setShowAdvanced={filters.setShowAdvanced}
        filteredCount={filters.filteredVehicles.length}
        resetFilters={filters.resetFilters}
      />
      <VehicleInventorySection
        vehicles={filters.filteredVehicles}
        filterByTab={filters.filterByTab}
        showHeader={false}
      />
    </div>
  );
}
