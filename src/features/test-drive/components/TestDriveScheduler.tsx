import { Calendar, CheckCircle2, Clock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AVAILABLE_TEST_DRIVE_TIMES } from "../services";
import { useTestDrive } from "../hooks";
import type { TestDriveVehicleOption } from "../types";

interface TestDriveSchedulerProps {
  vehicles: TestDriveVehicleOption[];
}

export function TestDriveScheduler({ vehicles }: TestDriveSchedulerProps) {
  const {
    today,
    selectedVehicleId,
    setSelectedVehicleId,
    date,
    setDate,
    time,
    setTime,
    phone,
    setPhone,
    notes,
    setNotes,
    error,
    authMessage,
    success,
    submitting,
    selectedVehicle,
    resetSuccess,
    handleSubmit,
  } = useTestDrive(vehicles);

  return (
    <section id="test-drive" className="py-24 px-6 lg:px-8 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-primary text-sm font-bold tracking-[0.3em] mb-4 uppercase">
            Book Your Slot
          </p>
          <h3 className="text-5xl md:text-6xl font-bold mb-4">SCHEDULE A TEST DRIVE</h3>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Pick your preferred vehicle, choose a valid date and time, and our team will help
            reserve your showroom test drive.
          </p>
        </div>

        <Card className="border-border overflow-hidden">
          <CardContent className="p-6 md:p-8">
            {success ? (
              <div className="text-center py-10">
                <CheckCircle2 className="mx-auto mb-5 text-green-600" size={64} />
                <h4 className="text-3xl font-bold mb-3">Test Drive Request Sent</h4>
                <p className="text-muted-foreground mb-6">
                  Your request for {selectedVehicle?.brand} {selectedVehicle?.name} on {date} at{" "}
                  {time} has been captured.
                </p>
                <Button
                  type="button"
                  onClick={resetSuccess}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  Book Another Test Drive
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {authMessage && (
                  <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm">
                    <LogIn className="text-primary mt-0.5" size={20} />
                    <p>{authMessage}</p>
                  </div>
                )}

                {error && (
                  <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle">Vehicle</Label>
                    <select
                      id="vehicle"
                      value={selectedVehicleId}
                      onChange={(event) => setSelectedVehicleId(event.target.value)}
                      className="h-12 w-full rounded-lg border border-border bg-background px-4 text-sm"
                    >
                      {vehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.brand} {vehicle.name} — {vehicle.year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+256 700 000 000"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-2">
                      <Calendar size={16} />
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      min={today}
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time" className="flex items-center gap-2">
                      <Clock size={16} />
                      Time
                    </Label>
                    <select
                      id="time"
                      value={time}
                      onChange={(event) => setTime(event.target.value)}
                      className="h-12 w-full rounded-lg border border-border bg-background px-4 text-sm"
                    >
                      <option value="">Select time</option>
                      {AVAILABLE_TEST_DRIVE_TIMES.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Optional note, preferred contact method, or special request..."
                    rows={4}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-primary text-white hover:bg-primary/90"
                >
                  {submitting ? "Submitting..." : "Submit Test Drive Request"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
