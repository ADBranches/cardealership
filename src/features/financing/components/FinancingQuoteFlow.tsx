import { FormEvent, useMemo, useState } from "react";
import { apiRequest, authenticatedApiRequest } from "../../../api/client";
import { useAuth } from "../../../features/auth/hooks";
import { Button } from "../../../components/ui/button";
import type { Vehicle } from "../../../features/cars/types";
const ugx = (n: number) =>
  new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 0,
  }).format(n);
export function FinancingQuoteFlow({ vehicle }: { vehicle: Vehicle }) {
  const { accessToken } = useAuth();
  const [down, setDown] = useState(Math.round(vehicle.price * 0.2)),
    [rate, setRate] = useState(18),
    [term, setTerm] = useState(48),
    [result, setResult] = useState<any>(),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [reference, setReference] = useState(""),
    [name, setName] = useState(""),
    [phone, setPhone] = useState(""),
    [whatsapp, setWhatsapp] = useState(""),
    [email, setEmail] = useState(""),
    [consent, setConsent] = useState(false);
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);
  const financing = {
    carPrice: vehicle.price,
    downPayment: Number(down),
    interestRate: Number(rate),
    loanTermMonths: Number(term),
  };
  async function request(path: string, body: any) {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    };
    return accessToken
      ? authenticatedApiRequest(path, accessToken, options)
      : apiRequest(path, options);
  }
  async function calculate() {
    setBusy(true);
    setError("");
    try {
      const r = await request("/api/finance/calculate", financing),
        p = await r.json();
      if (!r.ok)
        throw new Error(p.error?.message || p.error || "Unable to calculate.");
      setResult(p.results);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to calculate.");
    } finally {
      setBusy(false);
    }
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await request("/api/finance/leads", {
          carId: vehicle.id,
          customerName: name,
          customerPhone: phone,
          customerWhatsapp: whatsapp,
          customerEmail: email,
          financing: {
            downPayment: Number(down),
            interestRate: Number(rate),
            loanTermMonths: Number(term),
          },
          contactConsent: consent,
          idempotencyKey,
        }),
        p = await r.json();
      if (!r.ok)
        throw new Error(p.error?.message || "Unable to submit request.");
      setReference(p.referenceCode);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to submit request.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="space-y-5 rounded-xl border bg-card p-6">
      <div>
        <p className="text-sm font-semibold text-primary">
          Illustrative financing estimate
        </p>
        <h2 className="text-2xl font-bold">Finance {vehicle.name}</h2>
        <p className="text-sm text-muted-foreground">
          Rates are illustrative; this is not loan approval.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <label>
          Vehicle price
          <input
            disabled
            value={ugx(vehicle.price)}
            className="mt-1 w-full rounded border p-2"
          />
        </label>
        <label>
          Down payment
          <input
            type="number"
            min="0"
            value={down}
            onChange={(e) => setDown(Number(e.target.value))}
            className="mt-1 w-full rounded border p-2"
          />
        </label>
        <label>
          Annual interest rate (%)
          <input
            type="number"
            min="0"
            max="100"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="mt-1 w-full rounded border p-2"
          />
        </label>
        <label>
          Loan term (months)
          <input
            type="number"
            min="1"
            max="120"
            value={term}
            onChange={(e) => setTerm(Number(e.target.value))}
            className="mt-1 w-full rounded border p-2"
          />
        </label>
      </div>
      <Button type="button" disabled={busy} onClick={calculate}>
        Calculate estimate
      </Button>
      {result && (
        <div className="grid gap-3 rounded bg-muted p-4 md:grid-cols-3">
          <p>
            Monthly{" "}
            <strong className="block text-lg">
              {ugx(result.monthlyPayment)}
            </strong>
          </p>
          <p>
            Total{" "}
            <strong className="block text-lg">
              {ugx(result.totalPayment)}
            </strong>
          </p>
          <p>
            Interest{" "}
            <strong className="block text-lg">
              {ugx(result.totalInterest)}
            </strong>
          </p>
        </div>
      )}
      {reference ? (
        <p className="rounded bg-green-50 p-4 text-green-800">
          Quote received. Reference: <strong>{reference}</strong>. Panda Motors
          will contact you using your phone, WhatsApp, or email details
          provided.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-3 border-t pt-5">
          <h3 className="font-bold">Request a quote</h3>
          <p className="text-sm text-muted-foreground">
            Your primary phone is required. WhatsApp and email are optional ways
            Panda Motors can reach you.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              required
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded border p-2"
            />
            <input
              required
              placeholder="Primary phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded border p-2"
            />
            <input
              type="tel"
              placeholder="WhatsApp number (optional)"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="rounded border p-2"
            />
            <input
              type="email"
              placeholder="Email address (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded border p-2"
            />
          </div>
          <label className="flex gap-2 text-sm">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />{" "}
            I consent to Panda Motors contacting me about this quote using the
            details above.
          </label>
          <Button disabled={busy}>
            {busy ? "Submitting…" : "Request quote"}
          </Button>
        </form>
      )}
      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}
