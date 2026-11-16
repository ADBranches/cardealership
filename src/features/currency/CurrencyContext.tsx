import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiRequest } from "../../api/client";
import { isCurrency, readCurrencyPreference, requestRateSnapshot, saveCurrencyPreference, usableRate, type Currency, type RateSnapshot } from "./exchangeRates";

type RateState = { phase: "idle" | "loading" | "ready" | "unavailable"; snapshot: RateSnapshot | null };
interface CurrencyContextValue extends RateState {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  retry: () => void;
  activate: () => () => void;
  rate: number | null;
}
const CurrencyContext = createContext<CurrencyContextValue>({ currency: "UGX", setCurrency: () => {}, retry: () => {}, activate: () => () => {}, phase: "idle", snapshot: null, rate: 1 });
const getStorage = () => { try { return window.localStorage; } catch { return undefined; } };
const empty: RateState = { phase: "idle", snapshot: null };

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, select] = useState<Currency>(() => readCurrencyPreference(getStorage()));
  const [state, setState] = useState<RateState>(empty);
  const [generation, setGeneration] = useState(0);
  const [activeViews, setActiveViews] = useState(0);
  const needsRates = currency !== "UGX" && activeViews > 0;
  const activate = useCallback(() => {
    setActiveViews(value => value + 1);
    return () => setActiveViews(value => Math.max(0, value - 1));
  }, []);
  const setCurrency = useCallback((next: Currency) => {
    if (!isCurrency(next)) return;
    saveCurrencyPreference(getStorage(), next);
    select(next);
  }, []);
  const retry = useCallback(() => setGeneration(value => value + 1), []);

  useEffect(() => {
    if (!needsRates) { setState(empty); return; }
    let active = true, inFlight = false;
    let scheduled: ReturnType<typeof setTimeout> | undefined;
    let deadline: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;

    async function refresh() {
      if (!active || inFlight) return;
      clearTimeout(scheduled);
      if (document.visibilityState === "hidden") { scheduled = setTimeout(refresh, 60_000); return; }
      inFlight = true;
      controller = new AbortController();
      setState(previous => ({ phase: "loading", snapshot: previous.snapshot && previous.snapshot.validUntil > Date.now() ? previous.snapshot : null }));
      deadline = setTimeout(() => controller?.abort(), 8_000);
      let delay = 60_000;
      try {
        const snapshot = await requestRateSnapshot(apiRequest, controller.signal, import.meta.env.DEV);
        if (active) setState({ phase: "ready", snapshot });
        delay = Math.max(100, Math.min(60_000, snapshot.validUntil - Date.now()));
      } catch {
        if (active) setState({ phase: "unavailable", snapshot: null });
      } finally {
        clearTimeout(deadline);
        inFlight = false;
        if (active) scheduled = setTimeout(refresh, delay);
      }
    }
    const onVisible = () => { if (document.visibilityState === "visible") void refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    void refresh();
    return () => {
      active = false;
      controller?.abort();
      clearTimeout(deadline);
      clearTimeout(scheduled);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [needsRates, generation]);

  const value = useMemo<CurrencyContextValue>(() => ({ ...state, currency, setCurrency, retry, activate, rate: usableRate(state.snapshot, currency) }), [state, currency, setCurrency, retry, activate]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() { return useContext(CurrencyContext); }
