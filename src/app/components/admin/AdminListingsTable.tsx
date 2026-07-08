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
import type { VehicleStatus } from "../../lib/adminInventory";
import { buildPaginatedCarsUrl } from "../../lib/api";
import { EditVehicleModal } from "./EditVehicleModal";

type AdminVehicle = {
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
  vehicles: AdminVehicle[];
};

const DEFAULT_PAGE_SIZE = 12;

function formatUGX(amount: number) {
  if (amount >= 1_000_000_000) return `UGX ${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `UGX ${(amount / 1_000_000).toFixed(0)}M`;
  return `UGX ${amount.toLocaleString()}`;
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

export function AdminListingsTable({ vehicles }: AdminListingsTableProps) {
  const [listings, setListings] = useState(vehicles);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [isLoading] = useState(false);
  const [errorMessage] = useState("");
  const [vehicleToDelete, setVehicleToDelete] = useState<AdminVehicle | null>(null);
  const [vehicleToEdit, setVehicleToEdit] = useState<AdminVehicle | null>(null);

  useEffect(() => {
    setListings(vehicles);
    setCurrentPage(1);
  }, [vehicles]);

  function handleConfirmDelete() {
    if (!vehicleToDelete) return;

    // TODO: Replace this UI-only removal with protected DELETE /api/cars/:id
    // once the backend inventory endpoint and admin JWT middleware are confirmed.
    setListings((currentListings) =>
      currentListings.filter((vehicle) => vehicle.id !== vehicleToDelete.id)
    );

    setVehicleToDelete(null);
  }

  function handleSaveEdit(updatedVehicle: AdminVehicle) {
    // TODO: Replace this UI-only update with protected PUT /api/cars/:id
    // once the backend inventory endpoint and admin JWT middleware are confirmed.
    setListings((currentListings) =>
      currentListings.map((vehicle) =>
        vehicle.id === updatedVehicle.id
          ? {
              ...vehicle,
              price: updatedVehicle.price,
              condition: updatedVehicle.condition,
              status: updatedVehicle.status,
            }
          : vehicle
      )
    );

    setVehicleToEdit(null);
  }

  const totalPages = Math.max(1, Math.ceil(listings.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageListings = listings.slice(startIndex, endIndex);
  const paginatedCarsUrl = buildPaginatedCarsUrl({
    page: safeCurrentPage,
    limit: pageSize,
  });

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <h4 className="text-2xl font-bold mb-2">Loading Listings</h4>
        <p className="text-muted-foreground">
          Preparing the latest inventory records...
        </p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-8 text-center text-red-700">
        <h4 className="text-2xl font-bold mb-2">Unable To Load Listings</h4>
        <p>{errorMessage}</p>
      </div>
    );
  }

  if (!listings.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <h4 className="text-2xl font-bold mb-2">No Listings Available</h4>
        <p className="text-muted-foreground">
          There are currently no vehicle listings to manage.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
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
              {currentPageListings.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>
                    <div className="flex items-center gap-3 min-w-[240px]">
                      <img
                        src={vehicle.image}
                        alt={vehicle.name}
                        className="h-12 w-16 rounded-md object-cover border border-border"
                        onError={(event) => {
                          const target = event.target as HTMLImageElement;
                          target.src =
                            "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&q=80";
                        }}
                      />

                      <div>
                        <p className="font-semibold">{vehicle.name}</p>
                        <p className="text-xs text-muted-foreground">{vehicle.type}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>{vehicle.brand}</TableCell>
                  <TableCell>{vehicle.year}</TableCell>
                  <TableCell className="font-semibold text-primary">
                    {formatUGX(vehicle.price)}
                  </TableCell>
                  <TableCell>{vehicle.condition}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeClass(getVehicleStatus(vehicle))}>
                      {getVehicleStatus(vehicle)}
                    </Badge>
                  </TableCell>
                  <TableCell>{vehicle.specs.drive}</TableCell>

                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setVehicleToEdit(vehicle)}
                      >
                        Edit
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        className="bg-red-600 text-white hover:bg-red-700"
                        onClick={() => setVehicleToDelete(vehicle)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-4 border-t border-border px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-muted-foreground">
            Page {safeCurrentPage} of {totalPages} · Showing{" "}
            {listings.length ? startIndex + 1 : 0}-
            {Math.min(endIndex, listings.length)} of {listings.length} listings
          </div>

          <div className="text-xs text-muted-foreground">
            Future API: {paginatedCarsUrl}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={safeCurrentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
            >
              Previous
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={safeCurrentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(page + 1, totalPages))
              }
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <EditVehicleModal
        vehicle={vehicleToEdit}
        open={Boolean(vehicleToEdit)}
        onOpenChange={(open) => {
          if (!open) setVehicleToEdit(null);
        }}
        onSave={handleSaveEdit}
      />

      <DeleteConfirmModal
        vehicle={vehicleToDelete}
        open={Boolean(vehicleToDelete)}
        onOpenChange={(open) => {
          if (!open) setVehicleToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
