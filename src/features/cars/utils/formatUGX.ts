export function formatUGX(amount: number): string {
  if (amount >= 1_000_000_000) return `UGX ${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `UGX ${(amount / 1_000_000).toFixed(0)}M`;
  return `UGX ${amount.toLocaleString()}`;
}

export const MAX_PRICE_RANGE = 500_000_000;
