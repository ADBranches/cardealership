import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, LogIn, Mail } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "../services";
import { getSafeRedirectPath } from "../../../app/components/auth/routeAccess";

export function LoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = getSafeRedirectPath(searchParams.get("redirect"), "/");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const result = await login({ email, password });
    setMessage(result.message);
    if (result.success) navigate(redirect);
    setSubmitting(false);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit} aria-describedby={message ? "login-message" : undefined}>
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Administrator portal</p>
        <h2 id="login-title" className="text-3xl font-black tracking-tight sm:text-4xl">Welcome back</h2>
        <p className="text-sm leading-6 text-muted-foreground">Sign in to manage inventory, dispatch bookings, and dealership operations.</p>
      </div>

      {message && (
        <Alert id="login-message" aria-live="polite">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="login-email">Email address</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input id="login-email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="name@company.com" value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 rounded-xl pl-12" disabled={submitting} required />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="login-password">Password</Label>
          <span className="text-xs text-muted-foreground">Secure access</span>
        </div>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input id="login-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 rounded-xl px-12" disabled={submitting} required />
          <button type="button" className="absolute right-2 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => setShowPassword((visible) => !visible)} disabled={submitting} aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          </button>
        </div>
      </div>

      <Button type="submit" disabled={submitting} className="h-12 w-full rounded-xl text-sm font-bold shadow-lg shadow-primary/20">
        <LogIn aria-hidden="true" />
        {submitting ? "Signing in..." : "Sign in securely"}
      </Button>

      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">New here?</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Create a customer account to book test drives.{" "}
        <Link to="/register" className="font-bold text-primary underline-offset-4 hover:underline">Create account</Link>
      </p>
    </form>
  );
}
