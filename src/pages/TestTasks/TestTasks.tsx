import { AdminListingsTable } from "../../app/components/admin/AdminListingsTable";
import { CarImageUploader } from "../../app/components/admin/CarImageUploader";

import type { AdminVehicle } from "../../types/vehicle";


export default function TestTasks() {

  const vehicles: AdminVehicle[] = [
    {
      id: 1,
      name: "Toyota Land Cruiser ZX",
      brand: "Toyota",
      type: "SUV",
      year: 2023,
      price: 380000000,
      condition: "New",
      status: "Available",
      image:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
      specs: {
        power: "305 HP",
        engine: "3.5L V6",
        drive: "4WD",
      },
    },
    {
      id: 2,
      name: "BMW X5",
      brand: "BMW",
      type: "SUV",
      year: 2022,
      price: 295000000,
      condition: "Used",
      status: "Pending Test Drive",
      image:
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
      specs: {
        power: "335 HP",
        engine: "3.0L Turbo",
        drive: "AWD",
      },
    },
  ];


  return (
    <div className="p-10 space-y-10">

      <h1 className="text-4xl font-bold">
        Car Dealership Tasks Test
      </h1>


      <section>
        <h2 className="text-2xl font-bold mb-4">
          Task 1: Active Listings
        </h2>

        <AdminListingsTable vehicles={vehicles} />

      </section>


      <section>
        <h2 className="text-2xl font-bold mb-4">
          Task 2: Image Upload
        </h2>

        <CarImageUploader />

      </section>


    </div>
  );
}