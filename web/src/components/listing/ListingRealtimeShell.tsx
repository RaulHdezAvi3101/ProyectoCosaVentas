"use client";

import type { ReactNode } from "react";
import { ListingRoomProvider } from "@/lib/socket/listing-room-provider";

export function ListingRealtimeShell({
  listingId,
  children,
}: {
  listingId: string;
  children: ReactNode;
}) {
  return (
    <ListingRoomProvider listingId={listingId}>{children}</ListingRoomProvider>
  );
}
