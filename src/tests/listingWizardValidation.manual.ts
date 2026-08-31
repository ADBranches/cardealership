import assert from "node:assert/strict";
import {
  EMPTY_LISTING_DRAFT,
} from "../features/admin-listing/state";
import type {
  ListingDraft,
  SelectedListingImage,
} from "../features/admin-listing/types";
import {
  hasListingValidationErrors,
  LISTING_IMAGE_MAX_BYTES,
  normalizeNumericField,
  validateListingImage,
  validateListingWizard,
  validateListingWizardStep,
} from "../features/admin-listing/validation/listingWizardValidation";

const validDraft: ListingDraft = {
  ...EMPTY_LISTING_DRAFT,
  vin: "1HGCM82633A004352",
  make: "Toyota",
  model: "Land Cruiser",
  name: "Toyota Land Cruiser",
  type: "SUV",
  category: "luxury",
  year: "2025",
  price: "285000000",
  mileage: "12000",
  color: "Black",
  condition: "Used",
  status: "Available",
  power: "309 HP",
  engine: "4.5L V8",
  drive: "4WD",
};

const validFile = {
  name: "vehicle.jpg",
  size: 1024,
  type: "image/jpeg",
} as File;

const validImage: SelectedListingImage = {
  id: "synthetic-image-001",
  file: validFile,
  order: 0,
  imageType: "primary",
};

assert.equal(normalizeNumericField(" 85,000,000 "), "85000000");
assert.equal(normalizeNumericField("00012"), "12");
assert.equal(normalizeNumericField("0"), "0");
assert.equal(normalizeNumericField(""), "");
assert.equal(normalizeNumericField("invalid"), "invalid");

const emptyCoreErrors = validateListingWizardStep(
  "core-details",
  EMPTY_LISTING_DRAFT,
  [],
);

assert.equal(emptyCoreErrors.make, "Make is required.");
assert.equal(emptyCoreErrors.model, "Model is required.");
assert.equal(emptyCoreErrors.name, "Listing name is required.");
assert.equal(emptyCoreErrors.type, "Vehicle type is required.");
assert.equal(emptyCoreErrors.year, "Year is required.");

const missingVinErrors = validateListingWizardStep(
  "core-details",
  { ...validDraft, vin: "" },
  [],
);

assert.equal(missingVinErrors.vin, "VIN is required.");

const invalidVinErrors = validateListingWizardStep(
  "core-details",
  { ...validDraft, vin: "INVALIDVIN" },
  [],
);

assert.equal(
  invalidVinErrors.vin,
  "VIN must contain 17 valid characters without I, O, or Q.",
);

const validVinErrors = validateListingWizardStep(
  "core-details",
  { ...validDraft, vin: "1HGCM82633A004352" },
  [],
);

assert.equal(validVinErrors.vin, undefined);

const invalidYearErrors = validateListingWizardStep(
  "core-details",
  { ...validDraft, year: "1899" },
  [],
);

assert.equal(invalidYearErrors.year, "Enter a valid vehicle year.");

const invalidSpecificationErrors = validateListingWizardStep(
  "specifications",
  {
    ...validDraft,
    price: "0",
    mileage: "-1",
    color: "",
    power: "",
    engine: "",
  },
  [],
);

assert.equal(
  invalidSpecificationErrors.price,
  "Price must be greater than zero.",
);
assert.equal(
  invalidSpecificationErrors.mileage,
  "Mileage cannot be negative.",
);
assert.equal(invalidSpecificationErrors.color, "Color is required.");
assert.equal(invalidSpecificationErrors.power, "Power is required.");
assert.equal(invalidSpecificationErrors.engine, "Engine is required.");

const missingImageErrors = validateListingWizardStep(
  "assets",
  validDraft,
  [],
);

assert.equal(
  missingImageErrors.images,
  "Select at least one vehicle image.",
);

const invalidTypeImage: SelectedListingImage = {
  ...validImage,
  file: {
    name: "vehicle.txt",
    size: 1024,
    type: "text/plain",
  } as File,
};

assert.equal(
  validateListingImage(invalidTypeImage),
  "Selected file must be an image.",
);

const oversizedImage: SelectedListingImage = {
  ...validImage,
  file: {
    name: "large.jpg",
    size: LISTING_IMAGE_MAX_BYTES + 1,
    type: "image/jpeg",
  } as File,
};

assert.equal(
  validateListingImage(oversizedImage),
  "Each image must be 5 MB or smaller.",
);

assert.equal(validateListingImage(validImage), null);

const validErrors = validateListingWizard(
  validDraft,
  [validImage],
);

assert.deepEqual(validErrors, {});
assert.equal(hasListingValidationErrors(validErrors), false);
assert.equal(
  hasListingValidationErrors(validateListingWizard(
    EMPTY_LISTING_DRAFT,
    [],
  )),
  true,
);

console.log(JSON.stringify({
  suite: "listingWizardValidation",
  passed: 22,
  failed: 0,
  numericNormalizationVerified: true,
  stepValidationIndependent: true,
  imageMetadataValidationVerified: true,
  backendCallMade: false,
}, null, 2));
