import { Footer } from "../../app/components/Footer/Footer";
import { Navbar } from "../../app/components/Navbar/Navbar";

import { HeroSection } from "./components/HeroSection";
import { ServicesSection } from "./components/ServicesSection";
import { AboutSection } from "./components/AboutSection";
import { ContactSection } from "./components/ContactSection";

import { VehicleSearchSection } from "../../features/cars/components/VehicleSearchSection";
import { VehicleInventorySection } from "../../features/cars/components/VehicleInventorySection";
import { TestDriveScheduler } from "../../features/test-drive/components/TestDriveScheduler";

import { useCars, useVehicleFilters } from "../../features/cars/hooks";

export function HomePage() {
  const { vehicles, loading, error } = useCars();

  const filters = useVehicleFilters(vehicles);

  return (
    <>
      <Navbar />

      <main>
        <HeroSection />

        <VehicleSearchSection
          searchMake={filters.searchMake}
          setSearchMake={filters.setSearchMake}
          searchYear={filters.searchYear}
          setSearchYear={filters.setSearchYear}
          priceRange={filters.priceRange}
          setPriceRange={filters.setPriceRange}
          showAdvanced={filters.showAdvanced}
          setShowAdvanced={filters.setShowAdvanced}
          filteredCount={filters.filteredVehicles.length}
          resetFilters={filters.resetFilters}
        />

        {error && (
          <div className="px-6 py-10 text-center">
            <div className="mx-auto max-w-2xl rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          </div>
        )}

        <VehicleInventorySection
          loading={loading}
          vehicles={filters.filteredVehicles}
          filterByTab={filters.filterByTab}
          resetFilters={filters.resetFilters}
        />

        <TestDriveScheduler vehicles={vehicles} />

        <ServicesSection />

        <AboutSection />

        <ContactSection />
      </main>

      <Footer />
    </>
  );
}

