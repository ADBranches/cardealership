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

type CoreDetailsStepProps = {
  draft: ListingDraft;
  errors: ListingFieldErrors;
  onChange: <Field extends keyof ListingDraft>(
    field: Field,
    value: ListingDraft[Field],
  ) => void;
};

function FieldError({
  id,
  message,
}: {
  id: string;
  message?: string;
}) {
  if (!message) return null;

  return (
    <p id={id} className="text-sm font-medium text-destructive">
      {message}
    </p>
  );
}

export function CoreDetailsStep({
  draft,
  errors,
  onChange,
}: CoreDetailsStepProps) {
  return (
    <fieldset className="space-y-6">
      <legend className="text-xl font-semibold">Vehicle identity</legend>
      <p id="core-details-description" className="text-sm text-muted-foreground">
        Enter the identifiers and marketplace details used to distinguish the vehicle.
      </p>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="listing-vin">VIN</Label>
          <Input
            id="listing-vin"
            value={draft.vin}
            onChange={(event) =>
              onChange("vin", event.target.value.toUpperCase())
            }
            maxLength={17}
            autoComplete="off"
            placeholder="17-character vehicle identifier"
            aria-invalid={Boolean(errors.vin)}
            aria-describedby="listing-vin-description listing-vin-error"
          />
          <p id="listing-vin-description" className="text-xs text-muted-foreground">
            Use the 17-character identifier without I, O, or Q.
          </p>
          <FieldError id="listing-vin-error" message={errors.vin} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="listing-name">Listing name</Label>
          <Input
            id="listing-name"
            value={draft.name}
            onChange={(event) => onChange("name", event.target.value)}
            maxLength={120}
            placeholder="Toyota Land Cruiser V8"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "listing-name-error" : undefined}
          />
          <FieldError id="listing-name-error" message={errors.name} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="listing-make">Make</Label>
          <Input
            id="listing-make"
            value={draft.make}
            onChange={(event) => onChange("make", event.target.value)}
            maxLength={80}
            placeholder="Toyota"
            aria-invalid={Boolean(errors.make)}
            aria-describedby={errors.make ? "listing-make-error" : undefined}
          />
          <FieldError id="listing-make-error" message={errors.make} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="listing-model">Model</Label>
          <Input
            id="listing-model"
            value={draft.model}
            onChange={(event) => onChange("model", event.target.value)}
            maxLength={80}
            placeholder="Land Cruiser"
            aria-invalid={Boolean(errors.model)}
            aria-describedby={errors.model ? "listing-model-error" : undefined}
          />
          <FieldError id="listing-model-error" message={errors.model} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="listing-type">Vehicle type</Label>
          <Input
            id="listing-type"
            value={draft.type}
            onChange={(event) => onChange("type", event.target.value)}
            maxLength={60}
            placeholder="SUV"
            aria-invalid={Boolean(errors.type)}
            aria-describedby={errors.type ? "listing-type-error" : undefined}
          />
          <FieldError id="listing-type-error" message={errors.type} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="listing-year">Year</Label>
          <Input
            id="listing-year"
            type="number"
            min="1900"
            max={new Date().getFullYear() + 1}
            inputMode="numeric"
            value={draft.year}
            onChange={(event) => onChange("year", event.target.value)}
            aria-invalid={Boolean(errors.year)}
            aria-describedby={errors.year ? "listing-year-error" : undefined}
          />
          <FieldError id="listing-year-error" message={errors.year} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="listing-category">Category</Label>
          <Select
            value={draft.category}
            onValueChange={(value) =>
              onChange("category", value as ListingDraft["category"])
            }
          >
            <SelectTrigger id="listing-category">
              <SelectValue placeholder="Choose category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="luxury">Luxury</SelectItem>
              <SelectItem value="sport">Sport</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="listing-condition">Condition</Label>
          <Select
            value={draft.condition}
            onValueChange={(value) =>
              onChange("condition", value as ListingDraft["condition"])
            }
          >
            <SelectTrigger id="listing-condition">
              <SelectValue placeholder="Choose condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Used">Used</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </fieldset>
  );
}
