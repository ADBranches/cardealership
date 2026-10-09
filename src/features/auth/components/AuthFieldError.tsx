export function AuthFieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return <p id={id} role="alert" aria-live="polite" className="text-sm font-medium text-destructive">{message}</p>;
}
