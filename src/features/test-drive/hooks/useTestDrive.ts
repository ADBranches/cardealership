import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/features/auth/hooks";
import {
  AVAILABLE_TEST_DRIVE_TIMES,
  submitTestDriveBooking,
} from "../services";
import type { TestDriveBookingPayload, TestDriveVehicleOption } from "../types";

function getTodayDateInputValue() {
  return new Date().toISOString().split("T")[0];
}

export function useTestDrive(vehicles: TestDriveVehicleOption[]) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const today = useMemo(() => getTodayDateInputValue(), []);

  const [selectedVehicleId, setSelectedVehicleId] = useState(
    vehicles[0]?.id?.toString() ?? ""
  );
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedVehicle = vehicles.find(
    (vehicle) => vehicle.id.toString() === selectedVehicleId
  );

  const resetSuccess = () => setSuccess(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setAuthMessage("");
    setSuccess(false);

    if (!isAuthenticated) {
      setAuthMessage("Please sign in first so we can reserve your test drive securely.");
      setTimeout(() => {
        navigate(`/login?redirect=${encodeURIComponent("/#test-drive")}`);
      }, 1200);
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

    if (!time || !AVAILABLE_TEST_DRIVE_TIMES.includes(time as (typeof AVAILABLE_TEST_DRIVE_TIMES)[number])) {
      setError("Please choose a valid test drive time.");
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
  };
}
