import { Input } from "../../../app/components/ui/input";
import { Label } from "../../../app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../app/components/ui/select";
import type {
  ListingDraft,
  ListingFieldErrors,
} from "../types";

type SpecificationsStepProps = {
  draft: ListingDraft;
  errors: ListingFieldErrors;
  onChange: <Field extends keyof ListingDraft>(
    field: Field,
    value: ListingDraft[Field],
  ) => void;
};

type FieldProps = {
  id: string;
  label: string;
  description?: string;
  error?: string;
  value: string;
  placeholder: string;
  type?: "text" | "number";
  min?: string;
  maxLength?: number;
  onChange: (value: string) => void;
};

function SpecificationField({
  id,
  label,
  description,
  error,
  value,
  placeholder,
  type = "text",
  min,
  maxLength,
  onChange,
}: FieldProps) {
  const descriptionId = description ? id + "-description" : undefined;
  const errorId = error ? id + "-error" : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ");

  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        min={min}
        maxLength={maxLength}
        inputMode={type === "number" ? "numeric" : undefined}
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy || undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {description && (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function SpecificationsStep({
  draft,
  errors,
  onChange,
}: SpecificationsStepProps) {
  return (
    <fieldset className="space-y-6">
      <legend className="text-xl font-semibold">Vehicle specifications</legend>
      <p className="text-sm text-muted-foreground">
        Enter the confirmed marketplace, pricing, and mechanical details.
      </p>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <SpecificationField
          id="listing-price"
          label="Price in UGX"
          type="number"
          min="1"
          value={draft.price}
          placeholder="285000000"
          description="Enter a positive amount without currency symbols."
          error={errors.price}
          onChange={(value) => onChange("price", value)}
        />

        <SpecificationField
          id="listing-mileage"
          label="Mileage in kilometres"
          type="number"
          min="0"
          value={draft.mileage}
          placeholder="12000"
          description="Mileage may be zero but cannot be negative."
          error={errors.mileage}
          onChange={(value) => onChange("mileage", value)}
        />

        <SpecificationField
          id="listing-color"
          label="Exterior color"
          value={draft.color}
          placeholder="Black"
          maxLength={60}
          error={errors.color}
          onChange={(value) => onChange("color", value)}
        />

        <SpecificationField
          id="listing-engine"
          label="Engine"
          value={draft.engine}
          placeholder="4.5L V8"
          maxLength={100}
          error={errors.engine}
          onChange={(value) => onChange("engine", value)}
        />

        <SpecificationField
          id="listing-power"
          label="Power"
          value={draft.power}
          placeholder="309 HP"
          maxLength={80}
          error={errors.power}
          onChange={(value) => onChange("power", value)}
        />

        <div className="min-w-0 space-y-2">
          <Label htmlFor="listing-drive">Drive</Label>
          <Select
            value={draft.drive}
            onValueChange={(value) =>
              onChange("drive", value as ListingDraft["drive"])
            }
          >
            <SelectTrigger id="listing-drive">
              <SelectValue placeholder="Choose drive type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4WD">4WD</SelectItem>
              <SelectItem value="AWD">AWD</SelectItem>
              <SelectItem value="RWD">RWD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0 space-y-2 md:col-span-2">
          <Label htmlFor="listing-status">Initial inventory status</Label>
          <Select
            value={draft.status}
            onValueChange={(value) =>
              onChange("status", value as ListingDraft["status"])
            }
          >
            <SelectTrigger id="listing-status">
              <SelectValue placeholder="Choose inventory status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Pending Test Drive">Pending Test Drive</SelectItem>
              <SelectItem value="Reserved">Reserved</SelectItem>
              <SelectItem value="Sold">Sold</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Status uses the shared marketplace vehicle contract.
          </p>
        </div>
      </div>
    </fieldset>
  );
}
