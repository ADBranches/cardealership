export type DispatchSynchronization = {
  model: "manual-refresh";
  refresh: () => Promise<unknown>;
  cleanup: () => void;
};

export function createManualDispatchSynchronization(
  refresh: () => Promise<unknown>,
): DispatchSynchronization {
  let active = true;

  return {
    model: "manual-refresh",
    refresh: async () => {
      if (!active) return undefined;
      return refresh();
    },
    cleanup: () => {
      active = false;
    },
  };
}
