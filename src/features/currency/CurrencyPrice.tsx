import { useCurrency } from "./CurrencyContext";
import { formatVehiclePrice } from "./exchangeRates";

export function CurrencyPrice({ amountUGX, className = "" }: { amountUGX: number; className?: string }) {
  const { currency, rate, snapshot } = useCurrency();
  const original = formatVehiclePrice(amountUGX, "UGX");
  const estimated = currency !== "UGX" ? formatVehiclePrice(amountUGX, currency, rate) : null;
  const label = snapshot?.provider === "mock" ? "Demonstration estimate" : snapshot?.freshness === "fallback" ? "Cached estimate" : "Estimated price";
  return (
    <div className={className}>
      {estimated && original ? <>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="break-words text-3xl font-bold text-primary tabular-nums">≈ {estimated}</p>
        <p className="mt-1 text-sm font-medium text-muted-foreground">Original: {original}</p>
      </> : <p className="break-words text-3xl font-bold text-primary tabular-nums">{original ?? "Price on request"}</p>}
    </div>
  );
}
