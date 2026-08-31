import type {
  ListingDraft,
  ListingFieldErrors,
  ListingWizardStep,
  SelectedListingImage,
} from "../types";
import {
  createInitialListingWizardState,
  LISTING_WIZARD_STEPS,
  type ListingWizardState,
} from "./listingWizardInitialState";

export type ListingWizardAction =
  | {
      type: "draft/update";
      field: keyof ListingDraft;
      value: ListingDraft[keyof ListingDraft];
    }
  | { type: "images/set"; images: SelectedListingImage[] }
  | { type: "errors/client"; errors: ListingFieldErrors }
  | { type: "errors/server"; errors: ListingFieldErrors }
  | { type: "navigation/next" }
  | { type: "navigation/back" }
  | { type: "navigation/go"; step: ListingWizardStep }
  | { type: "submission/start" }
  | { type: "submission/finish" }
  | { type: "reset" }
  | { type: string; [key: string]: unknown };

function uniqueSteps(
  steps: ListingWizardStep[],
): ListingWizardStep[] {
  return [...new Set(steps)];
}

function removeFieldError(
  errors: ListingFieldErrors,
  field: keyof ListingDraft,
): ListingFieldErrors {
  const nextErrors = { ...errors };
  delete nextErrors[field];
  return nextErrors;
}

export function listingWizardReducer(
  state: ListingWizardState,
  action: ListingWizardAction,
): ListingWizardState {
  switch (action.type) {
    case "draft/update":
      return {
        ...state,
        draft: {
          ...state.draft,
          [action.field]: action.value,
        },
        clientErrors: removeFieldError(
          state.clientErrors,
          action.field,
        ),
        serverErrors: removeFieldError(
          state.serverErrors,
          action.field,
        ),
      };

    case "images/set":
      return {
        ...state,
        images: [...action.images]
          .sort((left, right) => left.order - right.order)
          .map((image, index) => ({
            ...image,
            order: index,
          })),
        clientErrors: {
          ...state.clientErrors,
          images: undefined,
        },
        serverErrors: {
          ...state.serverErrors,
          images: undefined,
        },
      };

    case "errors/client":
      return { ...state, clientErrors: { ...action.errors } };

    case "errors/server":
      return { ...state, serverErrors: { ...action.errors } };

    case "navigation/next": {
      if (Object.keys(state.clientErrors).length > 0) return state;

      const currentIndex = LISTING_WIZARD_STEPS.indexOf(
        state.currentStep,
      );

      if (currentIndex < 0 || currentIndex >= LISTING_WIZARD_STEPS.length - 1) {
        return state;
      }

      return {
        ...state,
        currentStep: LISTING_WIZARD_STEPS[currentIndex + 1],
        completedSteps: uniqueSteps([
          ...state.completedSteps,
          state.currentStep,
        ]),
        clientErrors: {},
      };
    }

    case "navigation/back": {
      const currentIndex = LISTING_WIZARD_STEPS.indexOf(
        state.currentStep,
      );

      if (currentIndex <= 0) return state;

      return {
        ...state,
        currentStep: LISTING_WIZARD_STEPS[currentIndex - 1],
        clientErrors: {},
      };
    }

    case "navigation/go": {
      const targetIndex = LISTING_WIZARD_STEPS.indexOf(action.step);
      const currentIndex = LISTING_WIZARD_STEPS.indexOf(
        state.currentStep,
      );

      if (targetIndex < 0 || targetIndex > currentIndex + 1) {
        return state;
      }

      if (
        targetIndex > currentIndex &&
        !state.completedSteps.includes(state.currentStep)
      ) {
        return state;
      }

      return {
        ...state,
        currentStep: action.step,
        clientErrors: {},
      };
    }

    case "submission/start":
      if (state.isSubmitting) return state;

      return {
        ...state,
        isSubmitting: true,
        submissionAttempted: true,
      };

    case "submission/finish":
      return { ...state, isSubmitting: false };

    case "reset":
      return createInitialListingWizardState();

    default:
      return state;
  }
}
