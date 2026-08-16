import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CustomerProfile, ProfileFormValues } from "../types";
import { hasProfileValidationErrors, validateProfile, type ProfileValidationErrors } from "../utils/profileValidation";

type ProfileFormProps = { profile: CustomerProfile };

export function ProfileForm({ profile }: ProfileFormProps) {
  const [values, setValues] = useState<ProfileFormValues>({ name: profile.name, email: profile.email });
  const [errors, setErrors] = useState<ProfileValidationErrors>({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => { setValues({ name: profile.name, email: profile.email }); }, [profile]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateProfile(values);
    setErrors(nextErrors);
    setMessage(hasProfileValidationErrors(nextErrors) ? null : "Profile update is ready, but saving remains disabled until the secured API contract is available.");
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
          {message && <p role="status" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}
          <Button type="submit">Validate changes</Button>
        </form>
      </CardContent>
    </Card>
  );
}
