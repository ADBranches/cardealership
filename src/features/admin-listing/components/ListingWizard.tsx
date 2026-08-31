import { Button } from "../../../app/components/ui/button";
import { useListingWizard } from "../hooks/useListingWizard";
import type { ListingFieldErrors } from "../types";
import { CoreDetailsStep } from "./CoreDetailsStep";
import { ListingWizardErrors } from "./ListingWizardErrors";
import { ListingWizardProgress } from "./ListingWizardProgress";
import { SpecificationsStep } from "./SpecificationsStep";

export function ListingWizard() {
  const {
    state,
    updateField,
    next,
    back,
    goToStep,
  } = useListingWizard();

  const combinedErrors: ListingFieldErrors = {
    ...state.serverErrors,
    ...state.clientErrors,
  };

  const isFirstStep = state.currentStep === "core-details";
  const isImplementedStep =
    state.currentStep === "core-details" ||
    state.currentStep === "specifications";

  function handleContinue() {
    next();
  }

  return (
    <section
      className="rounded-lg border border-border bg-card p-4 sm:p-6 md:p-8"
      aria-labelledby="listing-wizard-title"
    >
      <header className="mb-8">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-primary">
          Add inventory
        </p>
        <h2 id="listing-wizard-title" className="text-2xl font-bold sm:text-3xl">
          Add new vehicle
        </h2>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Enter the verified identity and specification details. Images and final submission remain unavailable until their implementation gates are approved.
        </p>
      </header>

      <ListingWizardProgress
        currentStep={state.currentStep}
        completedSteps={state.completedSteps}
        onStepSelect={goToStep}
      />

      <div className="mt-8 space-y-6">
        <ListingWizardErrors
          clientErrors={state.clientErrors}
          serverErrors={state.serverErrors}
        />

        {state.currentStep === "core-details" && (
          <CoreDetailsStep
            draft={state.draft}
            errors={combinedErrors}
            onChange={updateField}
          />
        )}

        {state.currentStep === "specifications" && (
          <SpecificationsStep
            draft={state.draft}
            errors={combinedErrors}
            onChange={updateField}
          />
        )}

        {state.currentStep === "assets" && (
          <div
            className="rounded-lg border border-dashed border-border bg-muted/30 p-6"
            role="status"
          >
            <h3 className="text-lg font-semibold">Vehicle images</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Image selection and upload are not implemented in this gate.
            </p>
          </div>
        )}

        {state.currentStep === "review" && (
          <div
            className="rounded-lg border border-dashed border-border bg-muted/30 p-6"
            role="status"
          >
            <h3 className="text-lg font-semibold">Review listing</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Final review and submission are not implemented in this gate.
            </p>
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={back}
            disabled={isFirstStep}
          >
            Back
          </Button>

          {isImplementedStep && (
            <Button
              type="button"
              onClick={handleContinue}
              disabled={state.isSubmitting}
            >
              Continue
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
