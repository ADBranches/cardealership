import type { ListingReviewStatus } from "../types";
const labels: Record<ListingReviewStatus, string> = { pending: "Pending", approved: "Approved", rejected: "Rejected" };
export function ListingStatusBadge({ status }: { status: ListingReviewStatus }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold listing-status-${status}`}>{labels[status]}</span>;
}
