"use client";

import type { Listing } from "@/types/marketplace";
import { useListingRoomContext } from "@/lib/socket/listing-room-provider";
import { ListingDetailActions } from "./ListingDetailActions";

export function ListingDetailFooter({ listing }: { listing: Listing }) {
  const { isLocked, state } = useListingRoomContext();

  const locked =
    isLocked ||
    listing.status === "locked" ||
    state?.status === "locked";

  return <ListingDetailActions listing={listing} locked={locked} />;
}
