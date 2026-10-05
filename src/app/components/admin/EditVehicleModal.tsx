import { useEffect, useState } from "react";
import type { VehicleStatus } from "../../lib/adminInventory";
import { VEHICLE_STATUSES } from "../../lib/adminInventory";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { AdminVehicle } from "../../../types/vehicle";

type EditVehicleModalProps = {
  vehicle: AdminVehicle | null;
  open: boolean;
  isSaving?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: {
    price: number;
    condition: string;
    status: VehicleStatus;
  }) => Promise<void> | void;
};

export function EditVehicleModal({
  vehicle,
  open,
  isSaving = false,
  onOpenChange,
  onSave,
}: EditVehicleModalProps) {
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("New");
  const [status, setStatus] = useState<VehicleStatus>("Available");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!vehicle) {
      return;
    }

    setPrice(vehicle.price.toString());
    setCondition(vehicle.condition);
    setStatus(vehicle.status ?? "Available");
    setError("");
  }, [vehicle]);

  async function handleSave() {
    if (!vehicle || isSaving) {
      return;
    }

    const parsedPrice = Number(price);

    if (!price.trim() || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError("Please enter a valid vehicle price.");
      return;
    }

    if (condition !== "New" && condition !== "Used") {
      setError("Condition must be either New or Used.");
      return;
    }

    setError("");

    try {
      await onSave({
        price: parsedPrice,
        condition,
        status,
      });
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to update the vehicle.",
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isSaving) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Vehicle Listing</DialogTitle>

          <DialogDescription>
            Update the vehicle price, condition, and inventory status. Saved
            changes are written directly to the dealership inventory.
          </DialogDescription>
        </DialogHeader>

        {vehicle && (
          <div className="space-y-5">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="font-semibold">
                {vehicle.make} {vehicle.model || vehicle.name}
              </p>

              <p className="text-sm text-muted-foreground">
                {vehicle.name} · Year: {vehicle.year}
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-price">Price</Label>

              <Input
                id="edit-price"
                type="number"
                min="1"
                value={price}
                disabled={isSaving}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="Enter vehicle price"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-condition">Condition</Label>

              <select
                id="edit-condition"
                value={condition}
                disabled={isSaving}
                onChange={(event) => setCondition(event.target.value)}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              >
                <option value="New">New</option>
                <option value="Used">Used</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>

              <select
                id="edit-status"
                value={status}
                disabled={isSaving}
                onChange={(event) =>
                  setStatus(event.target.value as VehicleStatus)
                }
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              >
                {VEHICLE_STATUSES.map((vehicleStatus) => (
                  <option key={vehicleStatus} value={vehicleStatus}>
                    {vehicleStatus}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={isSaving}
            className="bg-primary text-white hover:bg-primary/90"
            onClick={() => void handleSave()}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
