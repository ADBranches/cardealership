import { RefreshCw } from "lucide-react";
import { Button } from "../../../app/components/ui/button";
import { Skeleton } from "../../../app/components/ui/skeleton";
import { useDispatchBoard } from "../hooks/useDispatchBoard";
import { BOOKING_STATUS_COLUMNS } from "../validation/bookingTransitions";
import { DispatchColumn } from "./DispatchColumn";
import { DispatchErrorState } from "./DispatchErrorState";
import "./DispatchBoard.css";

export function DispatchBoard() {
  const { state, refresh, moveBooking } = useDispatchBoard();

  const isRefreshing = state.connectionStatus === "refreshing";

  if (state.connectionStatus === "idle") {
    return (
      <section
        aria-busy="true"
        aria-label="Loading dispatch board"
        className="dispatch-loading"
      >
        {BOOKING_STATUS_COLUMNS.map((status) => (
          <Skeleton key={status} className="h-64 w-full" />
        ))}
      </section>
    );
  }

  if (state.error && !state.bookings.length) {
    return (
      <DispatchErrorState
        message={state.error.message}
        onRetry={() => void refresh()}
      />
    );
  }

  return (
    <section
      className="dispatch-board"
      aria-labelledby="dispatch-board-title"
      aria-busy={isRefreshing}
    >
      <header className="dispatch-board-header">
        <div>
          <p>Test-drive operations</p>
          <h2 id="dispatch-board-title">Dispatch management</h2>
          <span>
            {state.bookings.length} bookings across four verified statuses
          </span>
        </div>

        <Button
          variant="outline"
          onClick={() => void refresh()}
          disabled={isRefreshing}
        >
          <RefreshCw
            aria-hidden="true"
            className={isRefreshing ? "animate-spin" : undefined}
          />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </header>

      {state.error && (
        <div role="alert" className="dispatch-inline-error">
          {state.error.message}
        </div>
      )}

      <nav
        className="dispatch-status-navigation"
        aria-label="Booking status navigation"
      >
        <a href="#dispatch-pending">Pending Approval</a>
        <a href="#dispatch-confirmed">Confirmed</a>
        <a href="#dispatch-completed">Completed</a>
        <a href="#dispatch-cancelled">Canceled</a>
      </nav>

      <div className="dispatch-grid">
        {BOOKING_STATUS_COLUMNS.map((status) => (
          <DispatchColumn
            key={status}
            status={status}
            bookings={state.bookings.filter(
              (booking) => booking.status === status,
            )}
            pendingByBooking={state.pendingByBooking}
            onMove={(id, target) => void moveBooking(id, target)}
          />
        ))}
      </div>
    </section>
  );
}
