import { useEffect, useState } from "react";
import { getCars } from "../services";
import type { Vehicle } from "../types";

export function useCars() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadVehicles() {
      try {
        setLoading(true);
        setError(null);
        const data = await getCars();
        if (!cancelled) {
          setVehicles(data);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load vehicles.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadVehicles();

    return () => {
      cancelled = true;
    };
  }, []);

  return { vehicles, loading, error };
}
