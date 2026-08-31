import { useCallback, useReducer } from "react";
import type {
  ListingDraft,
  ListingFieldErrors,
  ListingWizardStep,
  SelectedListingImage,
} from "../types";
import {
  createInitialListingWizardState,
  listingWizardReducer,
} from "../state";
import {
  hasListingValidationErrors,
  normalizeNumericField,
  validateListingWizard,
  validateListingWizardStep,
} from "../validation/listingWizardValidation";

export function useListingWizard() {
  const [state, dispatch] = useReducer(
    listingWizardReducer,
    undefined,
    createInitialListingWizardState,
  );

  const updateField = useCallback(
    <Field extends keyof ListingDraft>(
      field: Field,
      value: ListingDraft[Field],
    ) => {
      const nextValue =
        field === "year" || field === "price" || field === "mileage"
          ? normalizeNumericField(String(value))
          : value;

      dispatch({
        type: "draft/update",
        field,
        value: nextValue,
      });
    },
    [],
  );

  const setImages = useCallback(
    (images: SelectedListingImage[]) => {
      dispatch({ type: "images/set", images });
    },
    [],
  );

  const next = useCallback((): boolean => {
    const errors = validateListingWizardStep(
      state.currentStep,
      state.draft,
      state.images,
    );

    dispatch({ type: "errors/client", errors });

    if (hasListingValidationErrors(errors)) return false;

    dispatch({ type: "navigation/next" });
    return true;
  }, [state.currentStep, state.draft, state.images]);

  const back = useCallback(() => {
    dispatch({ type: "navigation/back" });
  }, []);

  const goToStep = useCallback((step: ListingWizardStep) => {
    dispatch({ type: "navigation/go", step });
  }, []);

  const setServerErrors = useCallback(
    (errors: ListingFieldErrors) => {
      dispatch({ type: "errors/server", errors });
    },
    [],
  );

  const beginSubmission = useCallback((): boolean => {
    if (state.isSubmitting) return false;

    const errors = validateListingWizard(
      state.draft,
      state.images,
    );

    dispatch({ type: "errors/client", errors });

    if (hasListingValidationErrors(errors)) return false;

    dispatch({ type: "submission/start" });
    return true;
  }, [state.draft, state.images, state.isSubmitting]);

  const finishSubmission = useCallback(() => {
    dispatch({ type: "submission/finish" });
  }, []);

  const reset = useCallback(() => {
    for (const image of state.images) {
      if (image.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(image.previewUrl);
      }
    }

    dispatch({ type: "reset" });
  }, [state.images]);

  return {
    state,
    updateField,
    setImages,
    next,
    back,
    goToStep,
    setServerErrors,
    beginSubmission,
    finishSubmission,
    reset,
  };
}
