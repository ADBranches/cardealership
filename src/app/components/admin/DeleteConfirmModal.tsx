import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

export type DeleteVehicle = {
  id: number | string;
  name?: string;
  make?: string;
  model?: string;
  year?: number;
  price?: number;
  condition?: string;
  status?: string;
  specs?: {
    drive?: string;
  };
};

type DeleteConfirmModalProps = {
  vehicle: DeleteVehicle | null;
  open: boolean;
  isDeleting?: boolean;
  error?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
};

function formatUGX(amount?: number) {
  if (amount === undefined) {
    return "Price not available";
  }

  if (amount >= 1_000_000_000) {
    return "UGX " + (amount / 1_000_000_000).toFixed(1) + "B";
  }

  if (amount >= 1_000_000) {
    return "UGX " + (amount / 1_000_000).toFixed(0) + "M";
  }

  return "UGX " + amount.toLocaleString();
}

function getVehicleLabel(vehicle: DeleteVehicle) {
  return (
    [vehicle.make, vehicle.model || vehicle.name]
      .filter(Boolean)
      .join(" ")
      .trim() || "Selected vehicle"
  );
}

export function DeleteConfirmModal({
  vehicle,
  open,
  isDeleting = false,
  error = "",
  onOpenChange,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!vehicle) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isDeleting) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Vehicle Removal</DialogTitle>

          <DialogDescription>
            This permanently removes the selected vehicle from dealership
            inventory. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
          <p className="font-semibold text-foreground">
            {getVehicleLabel(vehicle)}
          </p>

          <p className="text-sm text-muted-foreground">
            Listing: {vehicle.name ?? "Not available"}
          </p>

          <p className="text-sm text-muted-foreground">
            Year: {vehicle.year ?? "Not available"}
          </p>

          <p className="text-sm text-muted-foreground">
            Condition: {vehicle.condition ?? "Not available"}
          </p>

          <p className="text-sm text-muted-foreground">
            Status: {vehicle.status ?? "Not available"}
          </p>

          <p className="text-sm font-medium text-primary">
            {formatUGX(vehicle.price)}
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={() => void onConfirm()}
          >
            {isDeleting ? "Deleting..." : "Confirm Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
