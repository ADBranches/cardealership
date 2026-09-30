import { useRef, useState } from "react";
import { Button } from "../../../app/components/ui/button";
import { useAuth } from "../../auth/hooks";
import { useListingWizard } from "../hooks/useListingWizard";
import { createListingService } from "../services/listingApi";
import { createListingUploadService } from "../services/listingUploadApi";
import { createEmptySubmissionCheckpoint, createListingSubmissionCoordinator, type ListingSubmissionCheckpoint, type ListingSubmissionResult } from "../services/listingSubmissionCoordinator";
import type { ListingFieldErrors } from "../types";
import { AssetUploadStep } from "./AssetUploadStep";
import { CoreDetailsStep } from "./CoreDetailsStep";
import { ListingWizardErrors } from "./ListingWizardErrors";
import { ListingWizardProgress } from "./ListingWizardProgress";
import { ReviewPublishStep } from "./ReviewPublishStep";
import { SpecificationsStep } from "./SpecificationsStep";

type ListingWizardProps = { maximumImages: number; onPublishSuccess?: () => void };

export function ListingWizard({ maximumImages, onPublishSuccess }: ListingWizardProps) {
  const { accessToken, logout } = useAuth();
  const { state, updateField, setImages, next, back, goToStep, setServerErrors, beginSubmission, finishSubmission, reset } = useListingWizard();
  const [submissionResult, setSubmissionResult] = useState<ListingSubmissionResult | null>(null);
  const checkpointRef = useRef<ListingSubmissionCheckpoint>(createEmptySubmissionCheckpoint());
  const coordinatorRef = useRef(createListingSubmissionCoordinator({ listingService: createListingService(), uploadService: createListingUploadService() }));
  const combinedErrors: ListingFieldErrors = { ...state.serverErrors, ...state.clientErrors };
  const isFirstStep = state.currentStep === "core-details";
  const canContinue = state.currentStep !== "review";

  async function handlePublish() {
    if (!beginSubmission()) return;
    try {
      const result = await coordinatorRef.current.submit({ accessToken: accessToken ?? "", input: { draft: state.draft, images: state.images }, checkpoint: checkpointRef.current });
      checkpointRef.current = result.checkpoint;
      setSubmissionResult(result);
      if (!result.success) {
        setServerErrors(result.fieldErrors ?? {});
        if (result.code === "UNAUTHORIZED" || result.code === "SESSION_EXPIRED") logout();
        return;
      }
      reset();
      checkpointRef.current = createEmptySubmissionCheckpoint();
      onPublishSuccess?.();
    } finally { finishSubmission(); }
  }

  return <section className="rounded-lg border border-border bg-card p-4 sm:p-6 md:p-8" aria-labelledby="listing-wizard-title">
    <header className="mb-8"><p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-primary">Add inventory</p><h2 id="listing-wizard-title" className="text-2xl font-bold sm:text-3xl">Add new vehicle</h2><p className="mt-2 max-w-3xl text-muted-foreground">Enter, review, and publish verified vehicle information through the recoverable submission workflow.</p></header>
    <ListingWizardProgress currentStep={state.currentStep} completedSteps={state.completedSteps} onStepSelect={goToStep} />
    <div className="mt-8 space-y-6"><ListingWizardErrors clientErrors={state.clientErrors} serverErrors={state.serverErrors} />
      {state.currentStep === "core-details" && <CoreDetailsStep draft={state.draft} errors={combinedErrors} onChange={updateField} />}
      {state.currentStep === "specifications" && <SpecificationsStep draft={state.draft} errors={combinedErrors} onChange={updateField} />}
      {state.currentStep === "assets" && <AssetUploadStep images={state.images} maximumFiles={maximumImages} onImagesChange={setImages} />}
      {state.currentStep === "review" && <ReviewPublishStep draft={state.draft} images={state.images} result={submissionResult} isSubmitting={state.isSubmitting} onPublish={() => void handlePublish()} />}
      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between"><Button type="button" variant="outline" onClick={back} disabled={isFirstStep || state.isSubmitting}>Back</Button>{canContinue && <Button type="button" onClick={next} disabled={state.isSubmitting}>Continue</Button>}</div>
    </div>
  </section>;
}
