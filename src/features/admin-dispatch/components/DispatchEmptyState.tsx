import { CalendarDays } from "lucide-react";
export function DispatchEmptyState({ statusName }: { statusName: string }) {
  return <div className="dispatch-empty"><CalendarDays aria-hidden="true" size={28}/><p>No {statusName.toLowerCase()} bookings</p><span>Bookings in this status will appear here.</span></div>;
}
