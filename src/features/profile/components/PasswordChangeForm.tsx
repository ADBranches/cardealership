import { useState, type FormEvent } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePasswordChange } from "../hooks/usePasswordChange";
import type { PasswordChangeValues } from "../types";
import { hasPasswordValidationErrors, validatePasswordChange, type PasswordValidationErrors } from "../utils/passwordValidation";
import "./PasswordChangeForm.css";

const EMPTY_VALUES: PasswordChangeValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function PasswordChangeForm() {
  const [values, setValues] = useState<PasswordChangeValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<PasswordValidationErrors>({});
  const { isSubmitting, result, submitPasswordChange } = usePasswordChange();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validatePasswordChange(values);
    setErrors(nextErrors);
    if (hasPasswordValidationErrors(nextErrors)) return;

    const response = await submitPasswordChange(values);
    if (response.success) {
      setValues(EMPTY_VALUES);
      setErrors({});
    }
  }

  return (
    <Card className="profile-settings-wide">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><LockKeyhole size={22} />Change password</CardTitle>
        <CardDescription>Use the current password to authorize a secure password change.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="password-change-form" noValidate>
          <div className="space-y-2">
            <Label htmlFor="current-password">Current password</Label>
            <Input id="current-password" type="password" autoComplete="current-password" value={values.currentPassword} onChange={(event) => setValues((current) => ({ ...current, currentPassword: event.target.value }))} aria-invalid={Boolean(errors.currentPassword)} />
            {errors.currentPassword && <p className="password-field-error">{errors.currentPassword}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input id="new-password" type="password" autoComplete="new-password" value={values.newPassword} onChange={(event) => setValues((current) => ({ ...current, newPassword: event.target.value }))} aria-invalid={Boolean(errors.newPassword)} />
            {errors.newPassword && <p className="password-field-error">{errors.newPassword}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input id="confirm-password" type="password" autoComplete="new-password" value={values.confirmPassword} onChange={(event) => setValues((current) => ({ ...current, confirmPassword: event.target.value }))} aria-invalid={Boolean(errors.confirmPassword)} />
            {errors.confirmPassword && <p className="password-field-error">{errors.confirmPassword}</p>}
          </div>
          {result && <p role={result.success ? "status" : "alert"} className={result.success ? "password-message password-success" : "password-message password-error"}>{result.message}{result.success && result.mock ? " Synthetic development data was used." : ""}</p>}
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Changing password..." : "Change password"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
