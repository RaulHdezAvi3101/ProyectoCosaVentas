import Link from "next/link";
import { Bell } from "lucide-react";

interface LockedOverlayProps {
  listingId: string;
}

export function LockedOverlay({ listingId }: LockedOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/55 px-6 text-center text-white">
      <p className="text-lg font-semibold">Este artículo ya fue reclamado</p>
      <p className="mt-2 text-sm text-white/80">
        Si el ganador no paga en 30 min, podría liberarse.
      </p>
      <button
        type="button"
        className="mt-6 flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink"
      >
        <Bell className="h-4 w-4" />
        Avisarme si se libera
      </button>
      <Link
        href={`/listings/${listingId}/claim`}
        className="mt-4 text-xs text-white/70 underline"
      >
        Ver conversación
      </Link>
    </div>
  );
}
