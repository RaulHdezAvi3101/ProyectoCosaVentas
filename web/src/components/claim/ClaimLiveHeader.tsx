"use client";

import { useListingRoomContext } from "@/lib/socket/listing-room-provider";

export function ClaimLiveHeader() {
  const { isLocked, state, wasReleased } = useListingRoomContext();

  if (wasReleased && !isLocked && state?.status !== "locked") {
    return (
      <p className="text-xs font-medium text-accent-dark">● Liberado · LIVE</p>
    );
  }

  if (isLocked || state?.status === "locked") {
    return (
      <p className="text-xs font-medium text-muted">Reclamado · pago pendiente</p>
    );
  }

  return (
    <p className="text-xs text-coral font-medium">● LIVE · First to Claim</p>
  );
}
