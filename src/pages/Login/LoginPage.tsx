import { ArrowLeft, BadgeCheck, CarFront, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { LoginForm } from "@/features/auth/components/LoginForm";

export function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--primary)_18%,transparent),transparent_38%),radial-gradient(circle_at_bottom_right,color-mix(in_srgb,var(--primary)_10%,transparent),transparent_42%)]" />
      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-[1.08fr_0.92fr]">
        <section className="hidden border-r border-border/70 p-12 lg:flex lg:flex-col lg:justify-between xl:p-16" aria-label="Dealership platform overview">
          <Link to="/" className="inline-flex w-fit items-center gap-3 rounded-full border border-border/80 bg-card/70 px-4 py-2 text-sm font-semibold backdrop-blur-xl transition-colors hover:border-primary/50">
            <CarFront className="size-5 text-primary" aria-hidden="true" />
            Panda Motors
          </Link>

          <div className="max-w-xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="size-4" aria-hidden="true" />
              Premium vehicle operations
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-black leading-[1.05] tracking-tight xl:text-6xl">
                Manage every journey from one secure workspace.
              </h1>
              <p className="max-w-lg text-lg leading-8 text-muted-foreground">
                Access inventory workflows, test-drive dispatch, and operational insights through a focused administrator experience.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/80 bg-card/65 p-5 backdrop-blur-xl">
                <BadgeCheck className="mb-3 size-6 text-primary" aria-hidden="true" />
                <p className="font-semibold">Verified workflows</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Structured listing and dispatch controls with resilient recovery.</p>
              </div>
              <div className="rounded-2xl border border-border/80 bg-card/65 p-5 backdrop-blur-xl">
                <ShieldCheck className="mb-3 size-6 text-primary" aria-hidden="true" />
                <p className="font-semibold">Protected access</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Administrator routes remain guarded by the approved session flow.</p>
              </div>
            </div>
          </div>

          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Secure dealership operations</p>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12" aria-labelledby="login-title">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <Link to="/" className="inline-flex items-center gap-2 font-bold">
                <CarFront className="size-5 text-primary" aria-hidden="true" />
                Panda Motors
              </Link>
              <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Home
              </Link>
            </div>

            <div className="rounded-3xl border border-border/80 bg-card/85 p-6 shadow-2xl shadow-black/15 backdrop-blur-xl sm:p-9">
              <LoginForm />
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
              Protected by secure session verification. Never share administrator credentials.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
