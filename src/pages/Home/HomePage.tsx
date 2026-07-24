import { useEffect, useState } from "react";

import { Footer } from "../../app/components/Footer/Footer";
import { Navbar } from "../../app/components/Navbar/Navbar";

import { HeroSection } from "./components/HeroSection";
import { ServicesSection } from "./components/ServicesSection";
import { AboutSection } from "./components/AboutSection";
import { ContactSection } from "./components/ContactSection";

import { VehicleSearchSection } from "../../features/cars/components/VehicleSearchSection";
import { VehicleInventorySection } from "../../features/cars/components/VehicleInventorySection";
import { TestDriveScheduler } from "../../features/test-drive/components/TestDriveScheduler";

import type {
  Vehicle,
  InventoryTab,
} from "../../features/cars/types/car.types";



export function HomePage() {


  const [loading,setLoading] = useState(true);

  const [error,setError] = useState("");

  const [vehicles,setVehicles] = useState<Vehicle[]>([]);




  useEffect(()=>{


    async function loadVehicles(){


      try{


        setLoading(true);

        setError("");



        /*
        ============================================
        BACKEND CONNECTION READY
        ============================================

        When backend is ready:

        1. Remove the mock code below.
        2. Uncomment this API request.

        Example:

        const response = await fetch(
          "http://localhost:5000/api/cars"
        );


        if(!response.ok){
          throw new Error("Failed loading vehicles");
        }


        const data:Vehicle[] = await response.json();


        setVehicles(data);


        ============================================
        */



        // TEMPORARY MOCK DATA

        const mockVehicles:Vehicle[]=[


          {
            id:1,
            name:"Toyota Land Cruiser ZX",
            brand:"Toyota",
            category:"luxury",
            type:"SUV",
            year:2023,
            price:380000000,
            condition:"New",
            status:"Available",

            image:
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200",

            specs:{
              power:"305 HP",
              engine:"3.5L V6",
              drive:"4WD"
            }

          },


          {
            id:2,
            name:"BMW X5",
            brand:"BMW",
            category:"luxury",
            type:"SUV",
            year:2022,
            price:295000000,
            condition:"Used",
            status:"Available",

            image:
            "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200",

            specs:{
              power:"335 HP",
              engine:"3.0L Turbo",
              drive:"AWD"
            }

          },


          {
            id:3,
            name:"Ford Ranger Raptor",
            brand:"Ford",
            category:"luxury",
            type:"Pickup",
            year:2023,
            price:260000000,
            condition:"New",
            status:"Available",

            image:
            "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200",

            specs:{
              power:"292 HP",
              engine:"2.0L Bi-Turbo",
              drive:"4WD"
            }

          }

        ];



        // simulate server delay

        await new Promise(
          resolve=>setTimeout(resolve,2500)
        );



        setVehicles(mockVehicles);



      }
      catch(error){


        console.error(error);

        setError(
          "Unable to load vehicle inventory"
        );


      }
      finally{


        setLoading(false);


      }


    }



    loadVehicles();


  },[]);







  function filterByTab(
    tab:InventoryTab,
    list:Vehicle[]=vehicles
  ){



    if(tab==="all"){
      return list;
    }



    if(tab==="4x4"){

      return list.filter(
        vehicle =>
        vehicle.specs.drive==="4WD"
      );

    }



    return list.filter(
      vehicle =>
      vehicle.category===tab
    );

  }





  function resetFilters(){

    console.log(
      "Filters reset"
    );

  }






  return (

    <>


    <Navbar />


    <main>


      <HeroSection />



      <VehicleSearchSection

        searchBrand=""

        setSearchBrand={()=>{}}

        searchYear=""

        setSearchYear={()=>{}}

        priceRange={500000000}

        setPriceRange={()=>{}}

        showAdvanced={false}

        setShowAdvanced={()=>{}}

        filteredCount={vehicles.length}

        resetFilters={resetFilters}

      />




      {
        error && (

          <div className="text-center text-red-500 py-10">

            {error}

          </div>

        )
      }




      <VehicleInventorySection
  loading={loading}
  vehicles={vehicles}
  filterByTab={filterByTab}
  resetFilters={() => {
    console.log("Reset filters clicked");
  }}
/>




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