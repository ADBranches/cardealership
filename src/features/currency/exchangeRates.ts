export const CURRENCIES = ["UGX", "USD", "EUR", "GBP", "KES"] as const;
export type Currency = (typeof CURRENCIES)[number];
export const CURRENCY_LABELS: Record<Currency, string> = {
  UGX: "Ugandan shilling", USD: "US dollar", EUR: "Euro", GBP: "British pound", KES: "Kenyan shilling",
};
const MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const REFRESH_INTERVAL = 60_000;
export const CURRENCY_PREFERENCE_KEY = "panda-motors.display-currency";

export interface RateSnapshot {
  readonly provider: "frankfurter" | "mock";
  readonly source: "reference_provider" | "mock_provider" | "database_cache";
  readonly freshness: "fresh" | "fallback";
  readonly rates: Readonly<Partial<Record<Currency, number>>>;
  readonly observedAt: number;
  readonly retrievedAt: number;
  readonly expiresAt: number;
  readonly validUntil: number;
}

export function isCurrency(value: unknown): value is Currency {
  return typeof value === "string" && (CURRENCIES as readonly string[]).includes(value);
}

type PreferenceStorage = Pick<Storage, "getItem" | "setItem">;
export function readCurrencyPreference(storage?: PreferenceStorage): Currency {
  try { const value = storage?.getItem(CURRENCY_PREFERENCE_KEY); return isCurrency(value) ? value : "UGX"; }
  catch { return "UGX"; }
}
export function saveCurrencyPreference(storage: PreferenceStorage | undefined, currency: Currency): void {
  try { if (isCurrency(currency)) storage?.setItem(CURRENCY_PREFERENCE_KEY, currency); } catch { /* Storage is optional. */ }
}

function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
}
function timestamp(value: unknown): number {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) throw new Error("Invalid exchange-rate timestamp.");
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || date.toISOString() !== value) throw new Error("Invalid exchange-rate timestamp.");
  return date.getTime();
}

// Treat the API response as untrusted until the entire display contract passes.
export function parseRateSnapshot(payload: unknown, now: number, allowMock = false): RateSnapshot {
  if (!record(payload) || payload.success !== true || payload.baseCurrency !== "UGX" || !record(payload.rates)) throw new Error("Invalid exchange-rate response.");
  const { provider, source, freshness } = payload;
  if ((provider !== "frankfurter" && !(allowMock && provider === "mock")) || (freshness !== "fresh" && freshness !== "fallback") || (source !== "database_cache" && source !== (provider === "frankfurter" ? "reference_provider" : "mock_provider")) || (freshness === "fallback" && source !== "database_cache")) throw new Error("Invalid exchange-rate provenance.");
  const observedAt = timestamp(payload.observedAt), retrievedAt = timestamp(payload.retrievedAt), expiresAt = timestamp(payload.expiresAt);
  const usableUntil = timestamp(payload.usableUntil);
  if (!Number.isFinite(now) || observedAt > retrievedAt || retrievedAt > now + 60_000 || expiresAt <= retrievedAt || expiresAt - retrievedAt > 86_400_000 || now - observedAt > MAX_AGE) throw new Error("Invalid exchange-rate freshness.");
  if (usableUntil <= retrievedAt || usableUntil > observedAt + MAX_AGE || usableUntil > expiresAt + (freshness === "fallback" ? MAX_AGE : 0)) throw new Error("Invalid exchange-rate usability deadline.");
  const entries = Object.entries(payload.rates);
  if (entries.length < 2 || entries.length > 20 || payload.rates.UGX !== 1) throw new Error("Invalid exchange-rate currency set.");
  const rates: Partial<Record<Currency, number>> = {};
  for (const [code, value] of entries) {
    if (!/^[A-Z]{3}$/.test(code) || typeof value !== "number" || !Number.isFinite(value) || value <= 0) throw new Error("Invalid exchange rate.");
    if (isCurrency(code)) rates[code] = value;
  }
  const validUntil = Math.min(usableUntil, now + REFRESH_INTERVAL);
  if (validUntil <= now) throw new Error("Exchange rates expired.");
  return Object.freeze({ provider, source, freshness, rates: Object.freeze(rates), observedAt, retrievedAt, expiresAt, validUntil }) as RateSnapshot;
}

export type RateFetcher = (path: string, init: RequestInit) => Promise<Response>;
export async function requestRateSnapshot(fetcher: RateFetcher, signal: AbortSignal, allowMock = false, now = Date.now): Promise<RateSnapshot> {
  const response = await fetcher("/api/exchange-rates?baseCurrency=UGX", { method: "GET", headers: { Accept: "application/json" }, credentials: "omit", cache: "no-store", redirect: "error", signal });
  if (!response.ok) throw new Error("Exchange rates unavailable.");
  return parseRateSnapshot(await response.json(), now(), allowMock);
}

export function usableRate(snapshot: RateSnapshot | null, currency: Currency, now = Date.now()): number | null {
  if (currency === "UGX") return 1;
  if (!snapshot || !Number.isFinite(now) || now >= snapshot.validUntil || now < snapshot.retrievedAt - 60_000) return null;
  const rate = snapshot.rates[currency];
  return typeof rate === "number" && Number.isFinite(rate) && rate > 0 ? rate : null;
}

export function formatVehiclePrice(amountUGX: number, currency: Currency, rate: number | null = null): string | null {
  if (!isCurrency(currency) || !Number.isFinite(amountUGX) || amountUGX <= 0 || amountUGX > Number.MAX_SAFE_INTEGER) return null;
  let amount = amountUGX;
  if (currency !== "UGX") {
    if (rate === null || !Number.isFinite(rate) || rate <= 0) return null;
    amount *= rate;
  }
  if (!Number.isFinite(amount) || amount < 0.5 || amount > Number.MAX_SAFE_INTEGER) return null;
  return new Intl.NumberFormat("en-UG", { style: "currency", currency, currencyDisplay: "code", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}
