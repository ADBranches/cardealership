import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "../../../app/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../app/components/ui/dialog";
import type { BookingStatus } from "../types";
import { getAllowedBookingTransitions } from "../validation/bookingTransitions";
const LABELS: Record<BookingStatus,string>={pending:"Pending Approval",confirmed:"Confirmed",completed:"Completed",cancelled:"Canceled"};
export function DispatchActionMenu({ status, disabled, onAction }: { status: BookingStatus; disabled: boolean; onAction: (status: BookingStatus) => void }) {
 const [cancelOpen,setCancelOpen]=useState(false); const actions=getAllowedBookingTransitions(status);
 if(!actions.length) return <span className="dispatch-no-actions">No actions available</span>;
 return <div className="dispatch-actions" aria-label="Booking actions"><MoreHorizontal aria-hidden="true" size={16}/>{actions.map(target=>target==="cancelled"?<Button key={target} size="sm" variant="destructive" disabled={disabled} onClick={()=>setCancelOpen(true)}>Cancel booking</Button>:<Button key={target} size="sm" variant="outline" disabled={disabled} onClick={()=>onAction(target)}>Move to {LABELS[target]}</Button>)}<Dialog open={cancelOpen} onOpenChange={setCancelOpen}><DialogContent><DialogHeader><DialogTitle>Confirm booking cancellation</DialogTitle><DialogDescription>This action moves the booking to Canceled and cannot be reversed from the dispatch board.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={()=>setCancelOpen(false)}>Keep booking</Button><Button variant="destructive" onClick={()=>{setCancelOpen(false);onAction("cancelled")}}>Confirm cancellation</Button></DialogFooter></DialogContent></Dialog></div>;
}
