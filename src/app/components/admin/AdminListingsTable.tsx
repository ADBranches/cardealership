import { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import type { AdminVehicle } from "../../../types/vehicle";
import type { VehicleStatus } from "../../lib/adminInventory";
import { authenticatedApiRequest } from "../../../api/client";
import { useAuth } from "../../../features/auth/hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { EditVehicleModal } from "./EditVehicleModal";

type ApiCarImage = {
  id?: number;
  url?: string;
  image_url?: string;
  type?: string;
  image_type?: string;
};

type ApiCar = {
  id: number;
  vin?: string | null;
  make?: string | null;
  model?: string | null;
  name?: string | null;
  type?: string | null;
  category?: string | null;
  year?: number | string | null;
  price?: number | string | null;
  mileage?: number | string | null;
  color?: string | null;
  condition?: string | null;
  status?: string | null;
  description?: string | null;
  power?: string | null;
  engine?: string | null;
  drive?: string | null;
  primary_image?: string | null;
  images?: ApiCarImage[];
};

type CarsApiResponse = {
  success?: boolean;
  cars?: ApiCar[];
  car?: ApiCar;
  message?: string;
  error?: {
    message?: string;
  };
};

function formatUGX(amount: number) {
  if (amount >= 1_000_000_000) {
    return `UGX ${(amount / 1_000_000_000).toFixed(1)}B`;
  }

  if (amount >= 1_000_000) {
    return `UGX ${(amount / 1_000_000).toFixed(0)}M`;
  }

  return `UGX ${amount.toLocaleString()}`;
}

function getVehicleStatus(vehicle: AdminVehicle): VehicleStatus {
  if (
    vehicle.status === "Available" ||
    vehicle.status === "Pending Test Drive" ||
    vehicle.status === "Reserved" ||
    vehicle.status === "Sold"
  ) {
    return vehicle.status;
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

  if (status === "Reserved") {
    return "bg-blue-600 text-white hover:bg-blue-700";
  }

  return "bg-muted text-muted-foreground hover:bg-muted";
}

function getImageUrl(car: ApiCar): string {
  if (car.primary_image) {
    return car.primary_image;
  }

  const primaryImage = car.images?.find(
    (image) => image.type === "primary" || image.image_type === "primary",
  );

  if (primaryImage?.url) {
    return primaryImage.url;
  }

  if (primaryImage?.image_url) {
    return primaryImage.image_url;
  }

  const firstImage = car.images?.[0];

  return firstImage?.url ?? firstImage?.image_url ?? "";
}

function mapApiCarToAdminVehicle(car: ApiCar): AdminVehicle {
  const parsedYear = Number(car.year);
  const parsedPrice = Number(car.price);

  const parsedMileage =
    car.mileage === null || car.mileage === undefined || car.mileage === ""
      ? null
      : Number(car.mileage);

  const status: AdminVehicle["status"] =
    car.status === "Available" ||
    car.status === "Pending Test Drive" ||
    car.status === "Reserved" ||
    car.status === "Sold"
      ? car.status
      : "Available";

  return {
    id: Number(car.id),
    vin: car.vin ?? null,
    make: car.make?.trim() || "Unknown",
    model: car.model ?? null,
    name: car.name?.trim() || "Unnamed vehicle",
    type: car.type?.trim() || "Unknown",
    category: car.category ?? undefined,
    year: Number.isFinite(parsedYear) ? parsedYear : 0,
    price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
    mileage:
      parsedMileage !== null && Number.isFinite(parsedMileage)
        ? parsedMileage
        : null,
    color: car.color ?? null,
    condition: car.condition?.trim() || "Unknown",
    status,
    description: car.description ?? null,
    image: getImageUrl(car),
    specs: {
      power: car.power ?? "",
      engine: car.engine ?? "",
      drive: car.drive ?? "",
    },
  };
}

async function readApiPayload(
  response: Response,
): Promise<CarsApiResponse | null> {
  try {
    return (await response.json()) as CarsApiResponse;
  } catch {
    return null;
  }
}

export function AdminListingsTable() {
  const { accessToken } = useAuth();

  const [listings, setListings] = useState<AdminVehicle[]>([]);

  const [vehicleToEdit, setVehicleToEdit] = useState<AdminVehicle | null>(null);

  const [vehicleToDelete, setVehicleToDelete] = useState<AdminVehicle | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(true);

  const [loadError, setLoadError] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  const [deleteError, setDeleteError] = useState("");

  const loadInventory = useCallback(async () => {
    if (!accessToken) {
      setListings([]);
      setLoadError("Authentication is required to load inventory.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError("");

    try {
      const response = await authenticatedApiRequest("/api/cars", accessToken, {
        method: "GET",
      });

      const payload = await readApiPayload(response);

      if (!response.ok) {
        throw new Error(
          payload?.error?.message ??
            payload?.message ??
            `Unable to load inventory. Server returned ${response.status}.`,
        );
      }

      const cars = Array.isArray(payload?.cars) ? payload.cars : [];

      setListings(cars.map(mapApiCarToAdminVehicle));
    } catch (error) {
      setListings([]);

      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to load vehicle inventory.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  async function handleSaveEdit(updates: {
    price: number;
    condition: string;
    status: VehicleStatus;
  }) {
    if (!vehicleToEdit || !accessToken) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await authenticatedApiRequest(
        `/api/cars/${vehicleToEdit.id}`,
        accessToken,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        },
      );

      const payload = await readApiPayload(response);

      if (!response.ok) {
        throw new Error(
          payload?.error?.message ??
            payload?.message ??
            `Unable to update vehicle. Server returned ${response.status}.`,
        );
      }

      setVehicleToEdit(null);

      await loadInventory();
    } finally {
      setIsSaving(false);
    }
  }

  function handleDeleteClick(vehicle: AdminVehicle) {
    setDeleteError("");
    setVehicleToDelete(vehicle);
  }

  async function handleConfirmDelete() {
    if (!vehicleToDelete || !accessToken) {
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      const response = await authenticatedApiRequest(
        `/api/cars/${vehicleToDelete.id}`,
        accessToken,
        {
          method: "DELETE",
        },
      );

      const payload = await readApiPayload(response);

      if (!response.ok) {
        throw new Error(
          payload?.error?.message ??
            payload?.message ??
            `Unable to delete vehicle. Server returned ${response.status}.`,
        );
      }

      setVehicleToDelete(null);

      await loadInventory();
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Unable to delete the vehicle.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <h4 className="text-xl font-bold mb-2">Loading Inventory</h4>

        <p className="text-muted-foreground">
          Loading vehicle listings from the dealership API...
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-card p-8 text-center">
        <h4 className="text-xl font-bold mb-2">Unable to Load Inventory</h4>

        <p className="text-muted-foreground mb-6">{loadError}</p>

        <Button
          type="button"
          variant="outline"
          onClick={() => void loadInventory()}
        >
          Try Again
        </Button>
      </div>
    );
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
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {listings.length} vehicle
          {listings.length === 1 ? "" : "s"} loaded from inventory.
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={() => void loadInventory()}
        >
          Refresh Inventory
        </Button>
      </div>

      <div className="w-full overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Make</TableHead>
              <TableHead>Model</TableHead>
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

                  <TableCell>{listing.make}</TableCell>

                  <TableCell>{listing.model || "—"}</TableCell>

                  <TableCell>{listing.year}</TableCell>

                  <TableCell>{formatUGX(listing.price)}</TableCell>

                  <TableCell>{listing.condition}</TableCell>

                  <TableCell>
                    <Badge className={getStatusBadgeClass(status)}>
                      {status}
                    </Badge>
                  </TableCell>

                  <TableCell>{listing.specs.drive || "—"}</TableCell>

                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setVehicleToEdit(listing)}
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

      <EditVehicleModal
        open={Boolean(vehicleToEdit)}
        vehicle={vehicleToEdit}
        isSaving={isSaving}
        onOpenChange={(open) => {
          if (!open) {
            setVehicleToEdit(null);
          }
        }}
        onSave={handleSaveEdit}
      />

      <DeleteConfirmModal
        open={Boolean(vehicleToDelete)}
        vehicle={
          vehicleToDelete
            ? {
                id: vehicleToDelete.id,
                name: vehicleToDelete.name,
                make: vehicleToDelete.make,
                model: vehicleToDelete.model ?? undefined,
                year: vehicleToDelete.year,
                price: vehicleToDelete.price,
                condition: vehicleToDelete.condition,
                status: vehicleToDelete.status,
                specs: vehicleToDelete.specs,
              }
            : null
        }
        isDeleting={isDeleting}
        error={deleteError}
        onOpenChange={(open) => {
          if (!open) {
            setVehicleToDelete(null);
            setDeleteError("");
          }
        }}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
