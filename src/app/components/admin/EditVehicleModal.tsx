import { useEffect, useState } from "react";
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

type EditVehicle = {
  id: number;
  name: string;
  brand: string;
  year: number;
  price: number;
  condition: string;
};

type EditVehicleModalProps = {
  vehicle: EditVehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedVehicle: EditVehicle) => void;
};

export function EditVehicleModal({
  vehicle,
  open,
  onOpenChange,
  onSave,
}: EditVehicleModalProps) {
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("New");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!vehicle) return;

    setPrice(vehicle.price.toString());
    setCondition(vehicle.condition);
    setError("");
  }, [vehicle]);

  function handleSave() {
    if (!vehicle) return;

    const parsedPrice = Number(price);

    if (!price.trim() || Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("Please enter a valid vehicle price.");
      return;
    }

    if (!condition.trim()) {
      setError("Please select a valid vehicle condition.");
      return;
    }

    // TODO: Replace this UI-only update with protected PUT /api/cars/:id
    // once the backend inventory update endpoint and admin JWT middleware are confirmed.
    onSave({
      ...vehicle,
      price: parsedPrice,
      condition,
    });

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Vehicle Listing</DialogTitle>
          <DialogDescription>
            Update listing details for the selected vehicle. These changes are
            applied to the current admin dashboard view only until the protected
            backend update endpoint is connected.
          </DialogDescription>
        </DialogHeader>

        {vehicle && (
          <div className="space-y-5">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="font-semibold">
                {vehicle.brand} {vehicle.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Year: {vehicle.year}
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
                onChange={(event) => setPrice(event.target.value)}
                placeholder="Enter vehicle price"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-condition">Condition</Label>
              <select
                id="edit-condition"
                value={condition}
                onChange={(event) => setCondition(event.target.value)}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              >
                <option value="New">New</option>
                <option value="Used">Used</option>
                <option value="Sold">Sold</option>
              </select>
            </div>
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
            className="bg-primary text-white hover:bg-primary/90"
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
