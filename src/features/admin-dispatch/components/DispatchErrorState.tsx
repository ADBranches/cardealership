import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "../../../app/components/ui/button";
export function DispatchErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="dispatch-error" role="alert"><AlertCircle aria-hidden="true"/><div><strong>Dispatch board unavailable</strong><p>{message}</p></div><Button variant="outline" onClick={onRetry}><RefreshCw aria-hidden="true"/>Retry</Button></div>;
}
