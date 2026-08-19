import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CustomerProfile, ProfileFormValues } from "../types";
import { useProfileUpdate } from "../hooks/useProfileUpdate";
import { hasProfileValidationErrors, validateProfile, type ProfileValidationErrors } from "../utils/profileValidation";
import "./ProfileForm.css";

type ProfileFormProps = { profile: CustomerProfile };

export function ProfileForm({ profile }: ProfileFormProps) {
  const [values, setValues] = useState<ProfileFormValues>({ name: profile.name, email: profile.email });
  const [errors, setErrors] = useState<ProfileValidationErrors>({});
  const { isSubmitting, result, submitProfile } = useProfileUpdate();

  useEffect(() => { setValues({ name: profile.name, email: profile.email }); }, [profile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateProfile(values);
    setErrors(nextErrors);
    if (hasProfileValidationErrors(nextErrors)) return;
    await submitProfile(values);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact information</CardTitle>
        <CardDescription>Review the account details returned by the verified session.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="profile-name">Display name</Label>
            <Input id="profile-name" value={values.name} onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "profile-name-error" : undefined} />
            {errors.name && <p id="profile-name-error" className="text-sm text-red-700">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">Email address</Label>
            <Input id="profile-email" type="email" value={values.email} onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "profile-email-error" : undefined} />
            {errors.email && <p id="profile-email-error" className="text-sm text-red-700">{errors.email}</p>}
          </div>
          {result && (
            <p
              role={result.success ? "status" : "alert"}
              className={result.success ? "profile-form-message profile-form-success" : "profile-form-message profile-form-error"}
            >
              {result.message}
              {result.success && result.mock ? " Synthetic development data was used." : ""}
            </p>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
