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
  id: number;
  name: string;
  brand: string;
  year: number;
  price: number;
};

type DeleteConfirmModalProps = {
  vehicle: DeleteVehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

function formatUGX(amount: number) {
  if (amount >= 1_000_000_000) return `UGX ${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `UGX ${(amount / 1_000_000).toFixed(0)}M`;
  return `UGX ${amount.toLocaleString()}`;
}

export function DeleteConfirmModal({
  vehicle,
  open,
  onOpenChange,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Vehicle Removal</DialogTitle>
          <DialogDescription>
            This action removes the selected vehicle from the current admin
            dashboard view. Backend deletion will be connected later through the
            protected DELETE /api/cars/:id endpoint.
          </DialogDescription>
        </DialogHeader>

        {vehicle && (
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
            <p className="font-semibold">
              {vehicle.brand} {vehicle.name}
            </p>
            <p className="text-sm text-muted-foreground">Year: {vehicle.year}</p>
            <p className="text-sm text-muted-foreground">
              Price: {formatUGX(vehicle.price)}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button
            type="button"
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={onConfirm}
          >
            Confirm Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
