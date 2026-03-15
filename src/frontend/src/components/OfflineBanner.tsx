import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { WifiOff } from "lucide-react";

/**
 * Displays a sticky banner at the top of the viewport when the browser
 * loses network connectivity. Disappears automatically when back online.
 */
export default function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="sticky top-14 z-40 w-full bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium shadow-md no-print"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>
        You are offline — saved data may not be available until you reconnect.
      </span>
    </div>
  );
}
