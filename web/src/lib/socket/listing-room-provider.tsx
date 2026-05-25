"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import {
  useListingRoom,
  type ListingRoomValue,
} from "@/lib/socket/useListingRoom";

const ListingRoomContext = createContext<ListingRoomValue | null>(null);

export function ListingRoomProvider({
  listingId,
  children,
}: {
  listingId: string;
  children: ReactNode;
}) {
  const value = useListingRoom(listingId);
  return (
    <ListingRoomContext.Provider value={value}>
      {children}
    </ListingRoomContext.Provider>
  );
}

export function useListingRoomContext(): ListingRoomValue {
  const ctx = useContext(ListingRoomContext);
  if (!ctx) {
    throw new Error(
      "useListingRoomContext debe usarse dentro de ListingRoomProvider"
    );
  }
  return ctx;
}
