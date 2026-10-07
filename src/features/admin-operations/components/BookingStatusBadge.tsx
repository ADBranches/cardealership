import type { BookingStatus } from "../types";
const labels:Record<BookingStatus,string>={pending:"Pending",confirmed:"Confirmed",completed:"Completed",cancelled:"Cancelled",rejected:"Rejected"};
export function BookingStatusBadge({status}:{status:BookingStatus}){return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold booking-status-${status}`}>{labels[status]}</span>}
