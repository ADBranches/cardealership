import { useRef, useState } from "react";
import type { AdminListingReview } from "../types";
import { useAdminDashboard, usePendingListings } from "../hooks";
import { AdminOperationError } from "./AdminOperationError";
import { ListingDecisionDialog } from "./ListingDecisionDialog";
import { ListingReviewDialog } from "./ListingReviewDialog";
import { ListingStatusBadge } from "./ListingStatusBadge";
export function PendingListingsTable() {
  const { listings, loading, error, refresh, approve, reject } = usePendingListings();
  const { refresh: refreshStats } = useAdminDashboard();
  const [selected, setSelected] = useState<AdminListingReview | null>(null);
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [mutationError, setMutationError] = useState<string | null>(null);
  const inFlight = useRef(new Set<string>());
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>());
  const pendingListings = listings.filter((listing) => listing.status === "pending");
  function closeReview() { const id = selected?.id; setSelected(null); setDecision(null); if (id) queueMicrotask(() => triggerRefs.current.get(id)?.focus()); }
  async function decide(reason?: string) { if (!selected || !decision) return; const key = `${selected.id}:${decision}`; if (inFlight.current.has(key)) return; inFlight.current.add(key); setPendingId(selected.id); setMutationError(null); const result = decision === "approve" ? await approve(selected.id) : await reject(selected.id, reason ?? ""); if (result.success) { setNotice(`Listing ${selected.id} ${decision === "approve" ? "approved" : "rejected"}.`); await Promise.all([refresh(), refreshStats()]); closeReview(); } else { setMutationError(result.message); } inFlight.current.delete(key); setPendingId(null); }
  if (loading) return <section aria-busy="true" aria-label="Loading pending listings" className="rounded-xl border p-8">Loading pending listings...</section>;
  if (error && !listings.length) return <AdminOperationError message={error} onRetry={() => void refresh()} />;
  return <section aria-labelledby="pending-listings-title"><h2 id="pending-listings-title" className="text-2xl font-bold">Pending listing reviews</h2><p className="mt-2 text-muted-foreground">Review every submitted detail before making a decision.</p><div role="status" aria-live="polite" className="mt-3">{notice}</div>{mutationError && <div role="alert" className="mt-3 rounded-md border border-destructive p-3">{mutationError}<button type="button" onClick={() => void decide()} className="ml-3 underline">Retry</button></div>}{pendingListings.length === 0 ? <p className="mt-6 rounded-xl border p-8 text-center">No pending listings require review.</p> : <div className="mt-6 overflow-x-auto rounded-xl border"><table className="w-full min-w-[760px] text-left"><thead><tr><th className="p-3">ID</th><th className="p-3">Vehicle</th><th className="p-3">Year</th><th className="p-3">Price</th><th className="p-3">Submitted</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead><tbody>{pendingListings.map((listing) => <tr key={listing.id} className="border-t"><td className="p-3 font-mono">{listing.id}</td><td className="p-3">{listing.make} {listing.model}</td><td className="p-3">{listing.year ?? "Unavailable"}</td><td className="p-3">{listing.price ?? "Unavailable"}</td><td className="p-3">{listing.createdAt ?? "Unavailable"}</td><td className="p-3"><ListingStatusBadge status={listing.status} /></td><td className="p-3"><button ref={(node) => { if (node) triggerRefs.current.set(listing.id, node); }} type="button" disabled={pendingId === listing.id} onClick={() => setSelected(listing)} className="rounded-md border px-3 py-2">Review</button></td></tr>)}</tbody></table></div>}<ListingReviewDialog listing={selected} pending={selected ? pendingId === selected.id : false} onClose={closeReview} onApprove={() => setDecision("approve")} onReject={() => setDecision("reject")} /><ListingDecisionDialog mode={decision} pending={selected ? pendingId === selected.id : false} onCancel={() => setDecision(null)} onConfirm={(reason) => void decide(reason)} /></section>;
}
