"use client";

import { Eye } from "lucide-react";
import { useListingRoomContext } from "@/lib/socket/listing-room-provider";

interface ListingLiveBadgeProps {
  initialLive?: boolean;
}

export function ListingLiveBadge({ initialLive = false }: ListingLiveBadgeProps) {
  const { state, isLocked, viewers } = useListingRoomContext();

  const showLive =
    !isLocked && (state?.status === "live" || (initialLive && !state));

  if (!showLive) return null;

  const count = state?.viewers ?? viewers;

  return (
    <div className="absolute right-3 top-3 flex flex-col items-end gap-2">
      <span className="flex items-center gap-1 rounded-full bg-coral px-2.5 py-1 text-xs font-bold text-white animate-pulseLive">
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
        LIVE
      </span>
      {count > 0 && (
        <span className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
          <Eye className="h-3 w-3" />
          {count} mirando
        </span>
      )}
    </div>
  );
}
