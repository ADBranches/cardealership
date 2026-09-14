import type { ListingSubmissionResult } from "../services/listingSubmissionCoordinator";

type ListingSubmissionStatusProps = {
  result: ListingSubmissionResult | null;
  isSubmitting: boolean;
};

export function ListingSubmissionStatus({ result, isSubmitting }: ListingSubmissionStatusProps) {
  if (isSubmitting) {
    return <div role="status" aria-live="polite" className="rounded-lg border bg-muted/30 p-4">Publishing vehicle and processing images...</div>;
  }
  if (!result) return null;
  if (result.success) {
    return <div role="status" aria-live="polite" className="rounded-lg border border-green-600/40 bg-green-600/10 p-4"><p className="font-semibold">Vehicle published successfully</p><p className="mt-1 text-sm">Listing reference: {result.listingId}</p></div>;
  }
  return <div role="alert" className="rounded-lg border border-destructive/50 bg-destructive/10 p-4"><p className="font-semibold">Publication requires attention</p><p className="mt-1 text-sm">{result.message}</p>{result.checkpoint.listingId && <p className="mt-1 text-xs">Vehicle reference retained: {result.checkpoint.listingId}. Retrying will not create another vehicle.</p>}</div>;
}
