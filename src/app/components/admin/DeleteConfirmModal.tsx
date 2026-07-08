import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

type DeleteVehicle = {
  id: number | string;
  name?: string;
  make?: string;
  model?: string;
  brand?: string;
  year?: number;
  price?: number;
};

type DeleteConfirmModalProps = {
  vehicle: DeleteVehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

function formatUGX(amount?: number) {
  if (amount === undefined) return "Price not available";
  if (amount >= 1_000_000_000) return `UGX ${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `UGX ${(amount / 1_000_000).toFixed(0)}M`;
  return `UGX ${amount.toLocaleString()}`;
}

function getVehicleLabel(vehicle: DeleteVehicle) {
  const brandOrMake = vehicle.brand ?? vehicle.make ?? "";
  const modelOrName = vehicle.name ?? vehicle.model ?? "";

  return `${brandOrMake} ${modelOrName}`.trim() || "Selected vehicle";
}

export function DeleteConfirmModal({
  vehicle,
  open,
  onOpenChange,
  onConfirm,
}: DeleteConfirmModalProps) {
  function handleConfirmDelete() {
    if (!vehicle) return;

    onConfirm();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Vehicle Removal</DialogTitle>
          <DialogDescription>
            Please review the selected listing before removing it from the admin
            dashboard view. This prevents accidental inventory changes.
          </DialogDescription>
        </DialogHeader>

        {vehicle ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
              <p className="font-semibold">Deletion confirmation required</p>
              <p className="text-sm">
                This will remove the listing from the current UI state. Backend
                deletion will be connected later through the protected inventory
                endpoint.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
              <p className="font-semibold">{getVehicleLabel(vehicle)}</p>

              {vehicle.year !== undefined && (
                <p className="text-sm text-muted-foreground">
                  Year: {vehicle.year}
                </p>
              )}

              <p className="text-sm text-muted-foreground">
                Price: {formatUGX(vehicle.price)}
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Future backend integration: DELETE /api/cars/:id with an admin JWT.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">
              No vehicle is currently selected for deletion.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            className="bg-red-600 text-white hover:bg-red-700"
            disabled={!vehicle}
            onClick={handleConfirmDelete}
          >
            Confirm Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
