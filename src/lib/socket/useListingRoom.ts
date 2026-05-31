"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type {
  ClaimAttemptResult,
  ListingStateSnapshot,
} from "@/types/marketplace";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/types/socket";
import {
  getGuestDisplayName,
  getOrCreateGuestId,
  rememberGuestWinner,
} from "@/lib/guest/storage";

type ClaimSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export interface UseListingRoomState {
  connected: boolean;
  snapshot: ListingStateSnapshot | null;
  lastResult: ClaimAttemptResult | null;
  released: boolean;
  submitClaim: (phrase: string) => void;
}

export function useListingRoom(
  listingSlug: string,
  options?: { userId?: string },
): UseListingRoomState {
  const [connected, setConnected] = useState(false);
  const [snapshot, setSnapshot] = useState<ListingStateSnapshot | null>(null);
  const [lastResult, setLastResult] = useState<ClaimAttemptResult | null>(null);
  const [released, setReleased] = useState(false);
  const socketRef = useRef<ClaimSocket | null>(null);
  const pendingWinnerRememberRef = useRef(false);

  const socketAuth = useMemo(
    () => ({
      guestId: getOrCreateGuestId(),
      displayName: getGuestDisplayName(),
    }),
    [],
  );

  useEffect(() => {
    const socket: ClaimSocket = io({
      path: "/socket.io",
      auth: socketAuth,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("listing:join", { listingId: listingSlug });
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("listing:state", (nextSnapshot) => {
      setSnapshot(nextSnapshot);
      if (pendingWinnerRememberRef.current && nextSnapshot.winner?.userId) {
        rememberGuestWinner(listingSlug, nextSnapshot.winner.userId);
        pendingWinnerRememberRef.current = false;
      }
    });

    socket.on("claim:result", (result) => {
      setLastResult(result);
      if (result.outcome === "won") {
        pendingWinnerRememberRef.current = true;
        if (options?.userId) {
          rememberGuestWinner(listingSlug, options.userId);
          pendingWinnerRememberRef.current = false;
        }
      }
    });

    socket.on("listing:locked", () => {
      setReleased(false);
    });

    socket.on("listing:released", () => {
      setReleased(true);
      setLastResult(null);
      setSnapshot(null);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [listingSlug, options?.userId, socketAuth]);

  const submitClaim = useCallback((phrase: string) => {
    socketRef.current?.emit("claim:attempt", {
      listingId: listingSlug,
      phrase,
    });
  }, [listingSlug]);

  return {
    connected,
    snapshot,
    lastResult,
    released,
    submitClaim,
  };
}
