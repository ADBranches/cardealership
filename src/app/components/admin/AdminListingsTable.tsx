import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

type VehicleStatus = "Available" | "Pending Test Drive" | "Sold";

export type AdminVehicle = {
  id: number;
  name: string;
  brand: string;
  type: string;
  year: number;
  price: number;
  condition: string;
  status?: VehicleStatus;
  image: string;
  specs: {
    power: string;
    engine: string;
    drive: string;
  };
};

type AdminListingsTableProps = {
  vehicles?: AdminVehicle[];
};

const DEFAULT_VEHICLES: AdminVehicle[] = [
  {
    id: 1,
    name: "Land Cruiser V8",
    brand: "Toyota",
    type: "Luxury SUV",
    year: 2023,
    price: 285000000,
    condition: "New",
    status: "Available",
    image: "",
    specs: {
      power: "309 HP",
      engine: "4.5L V8",
      drive: "4WD",
    },
  },
  {
    id: 2,
    name: "S-Class S500",
    brand: "Mercedes-Benz",
    type: "Luxury Sedan",
    year: 2023,
    price: 360000000,
    condition: "New",
    status: "Available",
    image: "",
    specs: {
      power: "429 HP",
      engine: "3.0L V6T",
      drive: "RWD",
    },
  },
  {
    id: 3,
    name: "Range Rover Sport",
    brand: "Land Rover",
    type: "Sport Luxury SUV",
    year: 2023,
    price: 420000000,
    condition: "New",
    status: "Pending Test Drive",
    image: "",
    specs: {
      power: "395 HP",
      engine: "3.0L I6T",
      drive: "AWD",
    },
  },
];

function formatUGX(amount: number) {
  if (amount >= 1_000_000_000) return "UGX " + (amount / 1_000_000_000).toFixed(1) + "B";
  if (amount >= 1_000_000) return "UGX " + (amount / 1_000_000).toFixed(0) + "M";
  return "UGX " + amount.toLocaleString();
}

function getVehicleStatus(vehicle: AdminVehicle): VehicleStatus {
  if (vehicle.status) {
    return vehicle.status;
  }

  if (vehicle.condition === "Sold") {
    return "Sold";
  }

  return "Available";
}

function getStatusBadgeClass(status: VehicleStatus) {
  if (status === "Available") {
    return "bg-green-600 text-white hover:bg-green-700";
  }

  if (status === "Pending Test Drive") {
    return "bg-yellow-500 text-black hover:bg-yellow-600";
  }

  return "bg-muted text-muted-foreground hover:bg-muted";
}

export function AdminListingsTable({ vehicles = DEFAULT_VEHICLES }: AdminListingsTableProps) {
  const [listings, setListings] = useState<AdminVehicle[]>(vehicles);
  const [vehicleToDelete, setVehicleToDelete] = useState<AdminVehicle | null>(null);

  useEffect(() => {
    setListings(vehicles);
  }, [vehicles]);

  function handleEdit(vehicleId: number) {
    console.log("Edit vehicle:", vehicleId);
  }

  function handleDeleteClick(vehicle: AdminVehicle) {
    setVehicleToDelete(vehicle);
  }

  function handleConfirmDelete() {
    if (!vehicleToDelete) return;

    setListings((currentListings) =>
      currentListings.filter((vehicle) => vehicle.id !== vehicleToDelete.id)
    );

    console.log("Vehicle removed from UI state:", vehicleToDelete.id);
    console.log("Future backend endpoint: DELETE /api/cars/:id");

    setVehicleToDelete(null);
  }

  if (!listings.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <h4 className="text-xl font-bold mb-2">No Listings Available</h4>
        <p className="text-muted-foreground">
          There are currently no vehicle listings to manage.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Drive</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {listings.map((listing) => {
              const status = getVehicleStatus(listing);

              return (
                <TableRow key={listing.id}>
                  <TableCell className="font-medium">{listing.name}</TableCell>
                  <TableCell>{listing.brand}</TableCell>
                  <TableCell>{listing.year}</TableCell>
                  <TableCell>{formatUGX(listing.price)}</TableCell>
                  <TableCell>{listing.condition}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeClass(status)}>{status}</Badge>
                  </TableCell>
                  <TableCell>{listing.specs.drive}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(listing.id)}
                      >
                        Edit
                      </Button>

                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(listing)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <DeleteConfirmModal
        open={Boolean(vehicleToDelete)}
        vehicle={vehicleToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setVehicleToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
