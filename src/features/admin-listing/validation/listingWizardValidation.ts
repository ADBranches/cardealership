import type {
  ListingDraft,
  ListingFieldErrors,
  ListingWizardStep,
  SelectedListingImage,
} from "../types";

export const LISTING_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export function normalizeNumericField(value: string): string {
  const normalized = value.trim().replace(/,/g, "");

  if (!normalized) return "";

  const numericValue = Number(normalized);

  if (!Number.isFinite(numericValue)) return normalized;

  return String(numericValue);
}

export function validateListingImage(
  image: SelectedListingImage,
): string | null {
  if (!image.file.type.startsWith("image/")) {
    return "Selected file must be an image."; 
  }

  if (image.file.size > LISTING_IMAGE_MAX_BYTES) {
    return "Each image must be 5 MB or smaller."; 
  }

  return null;
}

function validateCoreDetails(
  draft: ListingDraft,
): ListingFieldErrors {
  const errors: ListingFieldErrors = {};
  const currentYear = new Date().getFullYear() + 1;
  const year = Number(normalizeNumericField(draft.year));

  if (!draft.make.trim()) errors.make = "Make is required."; 
  if (!draft.model.trim()) errors.model = "Model is required."; 
  if (!draft.name.trim()) errors.name = "Listing name is required."; 
  if (!draft.type.trim()) errors.type = "Vehicle type is required."; 

  if (!draft.year.trim()) {
    errors.year = "Year is required."; 
  } else if (
    !Number.isInteger(year) ||
    year < 1900 ||
    year > currentYear
  ) {
    errors.year = "Enter a valid vehicle year."; 
  }

  return errors;
}

function validateSpecifications(
  draft: ListingDraft,
): ListingFieldErrors {
  const errors: ListingFieldErrors = {};
  const price = Number(normalizeNumericField(draft.price));
  const mileage = Number(normalizeNumericField(draft.mileage));

  if (!draft.price.trim()) {
    errors.price = "Price is required."; 
  } else if (!Number.isFinite(price) || price <= 0) {
    errors.price = "Price must be greater than zero."; 
  }

  if (!draft.mileage.trim()) {
    errors.mileage = "Mileage is required."; 
  } else if (!Number.isFinite(mileage) || mileage < 0) {
    errors.mileage = "Mileage cannot be negative."; 
  }

  if (!draft.color.trim()) errors.color = "Color is required."; 
  if (!draft.power.trim()) errors.power = "Power is required."; 
  if (!draft.engine.trim()) errors.engine = "Engine is required."; 

  return errors;
}

function validateAssets(
  images: SelectedListingImage[],
): ListingFieldErrors {
  if (images.length === 0) {
    return { images: "Select at least one vehicle image." };
  }

  const imageError = images
    .map(validateListingImage)
    .find((error): error is string => error !== null);

  return imageError ? { images: imageError } : {};
}

export function validateListingWizardStep(
  step: ListingWizardStep,
  draft: ListingDraft,
  images: SelectedListingImage[],
): ListingFieldErrors {
  switch (step) {
    case "core-details":
      return validateCoreDetails(draft);
    case "specifications":
      return validateSpecifications(draft);
    case "assets":
      return validateAssets(images);
    case "review":
      return validateListingWizard(draft, images);
    default:
      return {};
  }
}

export function validateListingWizard(
  draft: ListingDraft,
  images: SelectedListingImage[],
): ListingFieldErrors {
  return {
    ...validateCoreDetails(draft),
    ...validateSpecifications(draft),
    ...validateAssets(images),
  };
}

export function hasListingValidationErrors(
  errors: ListingFieldErrors,
): boolean {
  return Object.keys(errors).length > 0;
}
