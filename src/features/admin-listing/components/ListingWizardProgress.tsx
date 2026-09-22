import type { KeyboardEvent } from "react";
import { LISTING_WIZARD_STEPS } from "../state";
import type { ListingWizardStep } from "../types";

const STEP_LABELS: Record<ListingWizardStep, string> = {
  "core-details": "Vehicle identity",
  specifications: "Specifications",
  assets: "Images",
  review: "Review",
};

type ListingWizardProgressProps = {
  currentStep: ListingWizardStep;
  completedSteps: ListingWizardStep[];
  onStepSelect: (step: ListingWizardStep) => void;
};

export function ListingWizardProgress({
  currentStep,
  completedSteps,
  onStepSelect,
}: ListingWizardProgressProps) {
  const currentIndex = LISTING_WIZARD_STEPS.indexOf(currentStep);

  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let targetIndex: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      targetIndex = Math.min(index + 1, currentIndex + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      targetIndex = Math.max(index - 1, 0);
    } else if (event.key === "Home") {
      targetIndex = 0;
    } else if (event.key === "End") {
      targetIndex = currentIndex;
    }

    if (targetIndex === null) return;

    event.preventDefault();

    const targetStep = LISTING_WIZARD_STEPS[targetIndex];
    const targetButton = document.getElementById(
      "listing-step-" + targetStep,
    );

    targetButton?.focus();
  }

  return (
    <nav aria-label="Vehicle listing progress">
      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {LISTING_WIZARD_STEPS.map((step, index) => {
          const isCurrent = step === currentStep;
          const isCompleted = completedSteps.includes(step);
          const isAvailable = index <= currentIndex || isCompleted;

          return (
            <li key={step}>
              <button
                id={"listing-step-" + step}
                type="button"
                className={
                  "min-h-14 w-full rounded-md border px-4 py-3 text-left " +
                  "text-sm transition focus-visible:outline-none " +
                  "focus-visible:ring-2 focus-visible:ring-ring " +
                  (isCurrent
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground")
                }
                aria-current={isCurrent ? "step" : undefined}
                aria-label={
                  "Step " +
                  (index + 1) +
                  " of " +
                  LISTING_WIZARD_STEPS.length +
                  ": " +
                  STEP_LABELS[step]
                }
                disabled={!isAvailable}
                onClick={() => onStepSelect(step)}
                onKeyDown={(event) => handleKeyDown(event, index)}
              >
                <span className="block font-semibold">
                  {index + 1}. {STEP_LABELS[step]}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {isCurrent
                    ? "Current step"
                    : isCompleted
                      ? "Completed"
                      : "Not completed"}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <p className="sr-only" role="status" aria-live="polite">
        Current step: {STEP_LABELS[currentStep]}.
      </p>
    </nav>
  );
}
