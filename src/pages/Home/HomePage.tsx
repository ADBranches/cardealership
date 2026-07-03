import { useCars, useVehicleFilters } from "@/features/cars/hooks";
import {
  VehicleInventorySection,
  VehicleSearchSection,
} from "@/features/cars/components";
import { TestDriveScheduler } from "@/features/test-drive/components";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { HeroSection } from "./components/HeroSection";
import { ServicesSection } from "./components/ServicesSection";
import { AboutSection } from "./components/AboutSection";
import { ContactSection } from "./components/ContactSection";

export function HomePage() {
  const { vehicles, loading, error } = useCars();
  const filters = useVehicleFilters(vehicles);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-6 text-center">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  const testDriveVehicles = vehicles.map(({ id, name, brand, year }) => ({
    id,
    name,
    brand,
    year,
  }));

  return (
    <>
      <HeroSection />
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
      />
      <TestDriveScheduler vehicles={testDriveVehicles} />
      <ServicesSection />
      <AboutSection />
      <ContactSection />
    </>
  );
}
