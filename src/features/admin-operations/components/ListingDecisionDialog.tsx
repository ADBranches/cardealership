import { useState } from "react";
import { validateRejectionReason } from "../validation/listingReviewValidation";
export function ListingDecisionDialog({ mode, pending, onCancel, onConfirm }: { mode: "approve" | "reject" | null; pending: boolean; onCancel: () => void; onConfirm: (reason?: string) => void }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  if (!mode) return null;
  function submit() { if (mode === "approve") { onConfirm(); return; } const result = validateRejectionReason(reason); if (!result.valid) { setError(result.message); return; } onConfirm(result.value); }
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"><section role="dialog" aria-modal="true" aria-labelledby="listing-decision-title" className="w-full max-w-md rounded-xl bg-background p-6"><h2 id="listing-decision-title" className="text-xl font-bold">{mode === "approve" ? "Confirm approval" : "Reject listing"}</h2>{mode === "reject" && <label className="mt-4 grid gap-2">Reason<textarea value={reason} onChange={(event) => { setReason(event.target.value); setError(null); }} maxLength={500} className="min-h-28 rounded-md border p-3" />{error && <span role="alert" className="text-destructive">{error}</span>}</label>}<div className="mt-6 flex justify-end gap-3"><button type="button" disabled={pending} onClick={onCancel}>Cancel</button><button type="button" disabled={pending} onClick={submit} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">{pending ? "Saving..." : "Confirm"}</button></div></section></div>;
}
