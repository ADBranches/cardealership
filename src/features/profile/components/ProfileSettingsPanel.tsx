import { AlertCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { useProfile } from "../hooks";
import { ProfileForm } from "./ProfileForm";
import { PasswordChangeForm } from "./PasswordChangeForm";
import { BookingHistory } from "./BookingHistory";
import { ProfileSummaryCard } from "./ProfileSummaryCard";
import "./ProfileSettingsPanel.css";

export function ProfileSettingsPanel() {
  const { profile, status, error } = useProfile();
  if (status === "loading") return <LoadingSpinner />;
  if (status === "error") return <div role="alert" className="profile-state profile-state-error"><AlertCircle size={22} /><p>{error}</p></div>;
  if (status === "empty" || !profile) return <div className="profile-state"><p>No verified profile information is available.</p></div>;

  return (
    <div className="profile-settings-grid">
      <ProfileSummaryCard profile={profile} />
      <ProfileForm profile={profile} />
      <PasswordChangeForm />
      <BookingHistory />
    </div>
  );
}
