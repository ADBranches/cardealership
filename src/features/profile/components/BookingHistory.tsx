import {
  AlertCircle,
  CalendarClock,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useBookingHistory } from "../hooks/useBookingHistory";
import { groupBookingHistory } from "../utils/bookingHistory";
import type { BookingHistoryItem } from "../types";
import "./BookingHistory.css";

function BookingGroup({ items }: { items: BookingHistoryItem[] }) {
  if (items.length === 0) {
    return <div className="booking-state">No bookings in this group.</div>;
  }

  return (
    <div className="booking-list">
      {items.map((booking) => (
        <Card key={booking.id}>
          <CardContent className="booking-item">
            <div>
              <strong>{booking.vehicleName}</strong>
              <p>{booking.date} at {booking.time}</p>
            </div>
            <Badge className={`booking-${booking.status}`}>
              {booking.status}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function BookingHistory() {
  const { isLoading, result, refresh } = useBookingHistory();

  if (isLoading) {
    return (
      <Card className="profile-settings-wide">
        <CardContent className="booking-loading">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-28 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!result || !result.success) {
    return (
      <Card className="profile-settings-wide">
        <CardContent className="booking-state booking-error">
          <AlertCircle size={22} />
          <p>{result?.message ?? "Booking history is unavailable."}</p>
          <Button variant="outline" onClick={() => void refresh()}>
            <RefreshCw size={16} />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const groups = groupBookingHistory(result.bookings);

  return (
    <Card className="profile-settings-wide">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock size={22} />
          Test-drive history
        </CardTitle>
        {result.mock && (
          <p className="booking-mock">
            Synthetic development booking data is displayed.
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({groups.upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({groups.completed.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({groups.cancelled.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">
            <BookingGroup items={groups.upcoming} />
          </TabsContent>
          <TabsContent value="completed">
            <BookingGroup items={groups.completed} />
          </TabsContent>
          <TabsContent value="cancelled">
            <BookingGroup items={groups.cancelled} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
