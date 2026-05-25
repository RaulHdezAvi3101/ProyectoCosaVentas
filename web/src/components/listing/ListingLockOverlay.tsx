"use client";

import { useEffect, useState } from "react";
import type { Listing } from "@/types/marketplace";
import { LockedOverlay } from "@/components/listing/LockedOverlay";
import { ReleasedOverlay } from "@/components/listing/ReleasedOverlay";
import { useListingRoomContext } from "@/lib/socket/listing-room-provider";

export function ListingLockOverlay({ listing }: { listing: Listing }) {
  const { isLocked, state, wasReleased } = useListingRoomContext();
  const [showReleased, setShowReleased] = useState(false);

  useEffect(() => {
    if (wasReleased) setShowReleased(true);
  }, [wasReleased]);

  useEffect(() => {
    if (!showReleased) return;
    const t = setTimeout(() => setShowReleased(false), 8000);
    return () => clearTimeout(t);
  }, [showReleased]);

  const locked =
    isLocked ||
    listing.status === "locked" ||
    state?.status === "locked";

  if (showReleased && !locked) {
    return <ReleasedOverlay />;
  }

  if (!locked) return null;

  return <LockedOverlay listingId={listing.id} />;
}
