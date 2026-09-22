import type {
  ListingDraft,
  ListingFieldErrors,
  ListingWizardStep,
  SelectedListingImage,
} from "../types";

export const LISTING_WIZARD_STEPS: readonly ListingWizardStep[] = [
  "core-details",
  "specifications",
  "assets",
  "review",
];

export interface ListingWizardState {
  currentStep: ListingWizardStep;
  completedSteps: ListingWizardStep[];
  draft: ListingDraft;
  images: SelectedListingImage[];
  clientErrors: ListingFieldErrors;
  serverErrors: ListingFieldErrors;
  isSubmitting: boolean;
  submissionAttempted: boolean;
}

export const EMPTY_LISTING_DRAFT: ListingDraft = {
  vin: "",
  make: "",
  model: "",
  name: "",
  type: "",
  category: "luxury",
  year: "",
  price: "",
  mileage: "",
  color: "",
  condition: "Used",
  status: "Available",
  power: "",
  engine: "",
  drive: "4WD",
};

export function createInitialListingWizardState():
  ListingWizardState {
  return {
    currentStep: "core-details",
    completedSteps: [],
    draft: { ...EMPTY_LISTING_DRAFT },
    images: [],
    clientErrors: {},
    serverErrors: {},
    isSubmitting: false,
    submissionAttempted: false,
  };
}
