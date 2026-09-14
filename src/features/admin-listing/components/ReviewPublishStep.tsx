import { Button } from "../../../app/components/ui/button";
import type { ListingDraft, SelectedListingImage } from "../types";
import type { ListingSubmissionResult } from "../services/listingSubmissionCoordinator";
import { ListingSubmissionStatus } from "./ListingSubmissionStatus";

type ReviewPublishStepProps = {
  draft: ListingDraft;
  images: SelectedListingImage[];
  result: ListingSubmissionResult | null;
  isSubmitting: boolean;
  onPublish: () => void;
};

const text = (value: string) => value.trim();

export function ReviewPublishStep({ draft, images, result, isSubmitting, onPublish }: ReviewPublishStepProps) {
  const retryable = !result?.success && Boolean(result?.retryable);
  return (
    <section className="space-y-6" aria-labelledby="listing-review-title">
      <div><h3 id="listing-review-title" className="text-xl font-semibold">Review and publish</h3><p className="mt-1 text-sm text-muted-foreground">Confirm the sanitized vehicle summary before publication.</p></div>
      <dl className="grid grid-cols-1 gap-3 rounded-lg border p-4 sm:grid-cols-2">
        <div><dt className="text-xs text-muted-foreground">Vehicle</dt><dd className="font-medium">{text(draft.make)} {text(draft.model)}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Listing name</dt><dd className="font-medium">{text(draft.name)}</dd></div>
        <div><dt className="text-xs text-muted-foreground">VIN</dt><dd className="font-mono text-sm">{text(draft.vin).toUpperCase()}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Year</dt><dd>{text(draft.year)}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Price</dt><dd>UGX {Number(draft.price).toLocaleString()}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Mileage</dt><dd>{Number(draft.mileage).toLocaleString()} km</dd></div>
        <div><dt className="text-xs text-muted-foreground">Condition and status</dt><dd>{draft.condition}, {draft.status}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Images</dt><dd>{images.length} selected</dd></div>
      </dl>
      <ListingSubmissionStatus result={result} isSubmitting={isSubmitting} />
      {!result?.success && <Button type="button" onClick={onPublish} disabled={isSubmitting}>{isSubmitting ? "Publishing..." : retryable ? "Retry publication" : "Publish vehicle"}</Button>}
    </section>
  );
}
