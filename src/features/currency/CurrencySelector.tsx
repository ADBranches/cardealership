import { useEffect, useId } from "react";
import { Globe2, RefreshCw } from "lucide-react";
import { CURRENCIES, CURRENCY_LABELS, isCurrency } from "./exchangeRates";
import { useCurrency } from "./CurrencyContext";

export function CurrencySelector() {
  const id = useId();
  const { currency, setCurrency, phase, rate, snapshot, retry, activate } = useCurrency();
  useEffect(() => activate(), [activate]);
  const converted = currency !== "UGX" && rate !== null && snapshot !== null;
  const waiting = currency !== "UGX" && (phase === "loading" || phase === "idle") && !converted;
  const unavailable = currency !== "UGX" && !converted && !waiting;
  const date = snapshot ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" }).format(snapshot.observedAt) : "";
  const message = currency === "UGX" ? "Showing original Uganda shilling prices."
    : waiting ? "Fetching exchange rates. Showing original UGX prices meanwhile."
    : unavailable ? "Conversion unavailable. Original UGX prices remain visible."
    : snapshot?.provider === "mock" ? `Demonstration rates only — not market rates.${snapshot.freshness === "fallback" ? " Cached demonstration rates." : ""}`
    : snapshot?.freshness === "fallback" ? `Cached reference rates as of ${date} (UTC). Provider temporarily unavailable.`
    : `Frankfurter reference rates as of ${date} (UTC).`;

  return (
    <div className="mb-8 flex flex-col gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex min-w-0 items-start gap-3">
        <Globe2 className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Display currency</p>
          <p id={`${id}-status`} role="status" aria-live="polite" className="mt-1 text-sm text-muted-foreground">{message}</p>
          <p className="mt-1 text-xs text-muted-foreground">Conversions are estimates. Inventory filters, financing and final prices use UGX.</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
        <label className="sr-only" htmlFor={`${id}-currency`}>Display currency</label>
        <select id={`${id}-currency`} value={currency} aria-describedby={`${id}-status`} onChange={event => { if (isCurrency(event.target.value)) setCurrency(event.target.value); }} className="h-11 max-w-full rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          {CURRENCIES.map(code => <option key={code} value={code}>{code} — {CURRENCY_LABELS[code]}</option>)}
        </select>
        {unavailable && <button type="button" onClick={retry} className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><RefreshCw className="h-4 w-4" aria-hidden="true" /> Retry</button>}
      </div>
    </div>
  );
}
