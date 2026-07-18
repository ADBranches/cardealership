import { Footer } from "../../app/components/Footer/Footer";
import { Navbar } from "../../app/components/Navbar/Navbar";

import { HeroSection } from "./components/HeroSection";
import { ServicesSection } from "./components/ServicesSection";
import { AboutSection } from "./components/AboutSection";
import { ContactSection } from "./components/ContactSection";

import { VehicleSearchSection } from "../../features/cars/components/VehicleSearchSection";
import { VehicleInventorySection } from "../../features/cars/components/VehicleInventorySection";
import { TestDriveScheduler } from "../../features/test-drive/components/TestDriveScheduler";
import type { AdminVehicle } from "../../types/vehicle";
import type { Vehicle } from "../../features/cars/types/car.types";


export function HomePage() {

  const vehicles: Vehicle[] = [
  {
    id: 1,
    name: "Toyota Land Cruiser ZX",
    brand: "Toyota",
    category: "luxury",
    type: "luxury",
    year: 2023,
    price: 380000000,
    condition: "New",
    status: "Available",
    image: "...",
    specs: {
      power: "305 HP",
      engine: "3.5L V6",
      drive: "4WD",
    },
  },
];


  return (
    <>
      <Navbar />

      <main>

        <HeroSection />

        {/* Test search component */}
        <VehicleSearchSection
          searchBrand=""
          setSearchBrand={() => {}}
          searchYear=""
          setSearchYear={() => {}}
          priceRange={500000000}
          setPriceRange={() => {}}
          showAdvanced={false}
          setShowAdvanced={() => {}}
          filteredCount={vehicles.length}
          resetFilters={() => {}}
        />


        {/* Test inventory */}
        <VehicleInventorySection
          vehicles={vehicles}
          filterByTab={() => vehicles}
        />


        {/* Test drive */}
        <TestDriveScheduler 
          vehicles={vehicles}
        />


        <ServicesSection />

        <AboutSection />

        <ContactSection />

      </main>


      <Footer />
    </>
  );
}