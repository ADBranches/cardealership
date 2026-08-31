import { useEffect, useRef } from "react";
import type { ListingFieldErrors } from "../types";

type ListingWizardErrorsProps = {
  clientErrors: ListingFieldErrors;
  serverErrors: ListingFieldErrors;
};

const FIELD_LABELS: Record<string, string> = {
  vin: "VIN",
  make: "Make",
  model: "Model",
  name: "Listing name",
  type: "Vehicle type",
  year: "Year",
  price: "Price",
  mileage: "Mileage",
  color: "Color",
  power: "Power",
  engine: "Engine",
  images: "Images",
};

export function ListingWizardErrors({
  clientErrors,
  serverErrors,
}: ListingWizardErrorsProps) {
  const summaryRef = useRef<HTMLDivElement | null>(null);
  const errors = { ...serverErrors, ...clientErrors };
  const entries = Object.entries(errors).filter(
    (entry): entry is [string, string] =>
      typeof entry[1] === "string" && entry[1].length > 0,
  );

  useEffect(() => {
    if (entries.length === 0) return;

    summaryRef.current?.focus();

    const firstField = entries[0][0];
    document.getElementById("listing-" + firstField)?.focus();
  }, [entries.length]);

  if (entries.length === 0) return null;

  return (
    <div
      ref={summaryRef}
      tabIndex={-1}
      role="alert"
      aria-labelledby="listing-error-summary-title"
      className="rounded-lg border border-destructive/50 bg-destructive/10 p-4"
    >
      <h3 id="listing-error-summary-title" className="font-semibold">
        Check the following fields
      </h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        {entries.map(([field, message]) => (
          <li key={field}>
            <button
              type="button"
              className="text-left underline underline-offset-2"
              onClick={() =>
                document.getElementById("listing-" + field)?.focus()
              }
            >
              {FIELD_LABELS[field] ?? field}: {message}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
