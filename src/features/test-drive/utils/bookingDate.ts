const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function normalizeBookingDate(value: string): string {
  return value.trim();
}

export function isValidBookingDate(value: string, today = new Date()): boolean {
  const normalized = normalizeBookingDate(value);
  if (!DATE_PATTERN.test(normalized)) return false;
  const parsed = new Date(`${normalized}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return false;
  const [year, month, day] = normalized.split("-").map(Number);
  if (parsed.getFullYear() !== year || parsed.getMonth() + 1 !== month || parsed.getDate() !== day) return false;
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return parsed.getTime() >= startOfToday.getTime();
}
