import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "../services";

export function LoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const result = await login({ email, password });
    setMessage(result.message);

    if (result.success) {
      navigate(redirect);
    }

    setSubmitting(false);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <h2 className="text-3xl font-bold mb-2">Sign In</h2>
        <p className="text-sm text-muted-foreground">
          Access your account to book test drives and manage enquiries.
        </p>
      </div>

      {message && (
        <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">{message}</div>
      )}

      <Input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="h-12"
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="h-12"
        required
      />

      <Button
        type="submit"
        disabled={submitting}
        className="w-full h-12 bg-primary text-white hover:bg-primary/90"
      >
        {submitting ? "Signing in..." : "Sign In"}
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="text-primary font-semibold hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
