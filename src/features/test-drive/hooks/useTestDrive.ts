import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/features/auth/hooks";
import { submitTestDriveBooking } from "../services";
import type { TestDriveBookingPayload, TestDriveVehicleOption } from "../types";
import { useBookingAvailability } from "./useBookingAvailability";
import { canSubmitWithAvailability, shouldClearSelectedTime } from "../utils/availabilitySelection";

function getTodayDateInputValue() {
  return new Date().toISOString().split("T")[0];
}

export function useTestDrive(vehicles: TestDriveVehicleOption[]) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const today = useMemo(() => getTodayDateInputValue(), []);
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id?.toString() ?? "");
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const availability = useBookingAvailability(selectedVehicleId, date);
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id.toString() === selectedVehicleId);

  useEffect(() => {
    if (shouldClearSelectedTime(time, availability.result)) {
      setTime("");
    }
  }, [time, availability.result]);

  function handleVehicleChange(vehicleId: string) {
    setSelectedVehicleId(vehicleId);
    setTime("");
    setError("");
  }

  function handleDateChange(nextDate: string) {
    setDate(nextDate);
    setTime("");
    setError("");
  }

  const resetSuccess = () => setSuccess(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setAuthMessage("");
    setSuccess(false);

    if (submitting || availability.status === "loading") return;

    if (!isAuthenticated) {
      setAuthMessage("Please sign in first so we can reserve your test drive securely.");
      setTimeout(() => navigate(`/login?redirect=${encodeURIComponent("/#test-drive")}`), 1200);
      return;
    }

    if (!selectedVehicleId) {
      setError("Please choose a vehicle.");
      return;
    }

    if (!date || date < today) {
      setError("Please choose today or a future date.");
      return;
    }

    if (!canSubmitWithAvailability(availability.status, time, availability.result)) {
      setError(availability.status === "loading" ? "Availability is still being checked." : "Please choose an available test drive time.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    const bookingPayload: TestDriveBookingPayload = {
      vehicleId: selectedVehicleId,
      vehicleName: selectedVehicle?.name,
      date,
      time,
      phone,
      notes,
    };

    try {
      setSubmitting(true);
      await submitTestDriveBooking(bookingPayload);
      setSuccess(true);
      setNotes("");
    } catch {
      setError("Unable to submit your test drive request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    today, selectedVehicleId, setSelectedVehicleId: handleVehicleChange, date, setDate: handleDateChange, time, setTime, phone, setPhone, notes, setNotes, error, authMessage, success, submitting, selectedVehicle, availability, resetSuccess, handleSubmit,
  };
}
