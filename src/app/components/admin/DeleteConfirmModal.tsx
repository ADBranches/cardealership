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
  brand?: string;
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
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

function formatUGX(amount?: number) {
  if (amount === undefined) return "Price not available";
  if (amount >= 1_000_000_000) return "UGX " + (amount / 1_000_000_000).toFixed(1) + "B";
  if (amount >= 1_000_000) return "UGX " + (amount / 1_000_000).toFixed(0) + "M";
  return "UGX " + amount.toLocaleString();
}

function getVehicleLabel(vehicle: DeleteVehicle) {
  const brandOrMake = vehicle.brand ?? vehicle.make ?? "";
  const modelOrName = vehicle.name ?? vehicle.model ?? "";

  return (brandOrMake + " " + modelOrName).trim() || "Selected vehicle";
}

export function DeleteConfirmModal({
  vehicle,
  open,
  onOpenChange,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!vehicle) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Vehicle Removal</DialogTitle>
          <DialogDescription>
            Please review the selected listing before removing it from the admin dashboard view.
            Backend deletion is not connected yet.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
          <p className="font-semibold text-foreground">{getVehicleLabel(vehicle)}</p>
          <p className="text-sm text-muted-foreground">
            Year: {vehicle.year ?? "Not available"}
          </p>
          <p className="text-sm text-muted-foreground">
            Condition: {vehicle.condition ?? "Not available"}
          </p>
          <p className="text-sm text-muted-foreground">
            Drive: {vehicle.specs?.drive ?? "Not available"}
          </p>
          <p className="text-sm font-medium text-primary">{formatUGX(vehicle.price)}</p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            Confirm Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
