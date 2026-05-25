"use client";

import { useCallback, useEffect, useState } from "react";
import type { ListingStateSnapshot } from "@/types/marketplace";
import type { ClaimAttemptPayload } from "@/types/socket";
import { useClaimIdentity } from "@/lib/identity/useClaimIdentity";
import { getSocket } from "./client";

async function fetchListingState(
  listingId: string
): Promise<ListingStateSnapshot | null> {
  const res = await fetch(`/api/listings/${listingId}/state`);
  if (!res.ok) return null;
  return res.json() as Promise<ListingStateSnapshot | null>;
}

export interface ListingRoomValue {
  state: ListingStateSnapshot | null;
  connected: boolean;
  ready: boolean;
  attemptClaim: (
    phrase: string,
    onResult: (result: {
      outcome: "won" | "lost" | "invalid";
      paymentDeadline?: number;
    }) => void
  ) => void;
  isLocked: boolean;
  viewers: number;
  isLoggedIn: boolean;
  wasReleased: boolean;
}

export function useListingRoom(listingId: string): ListingRoomValue {
  const { userId, guestId, displayName, ready, isLoggedIn } =
    useClaimIdentity();
  const [state, setState] = useState<ListingStateSnapshot | null>(null);
  const [connected, setConnected] = useState(false);
  const [wasReleased, setWasReleased] = useState(false);

  const refreshState = useCallback(async () => {
    const data = await fetchListingState(listingId);
    if (data) setState(data);
  }, [listingId]);

  useEffect(() => {
    if (!listingId) return;

    let cancelled = false;

    fetchListingState(listingId)
      .then((data) => {
        if (!cancelled && data) setState(data);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [listingId]);

  useEffect(() => {
    if (!listingId || !ready) return;

    const socket = getSocket();
    if (!socket) return;

    const onConnect = () => {
      setConnected(true);
      socket.emit("listing:join", {
        listingId,
        guestId,
        displayName,
        userId,
      });
    };

    const onState = (snapshot: ListingStateSnapshot) => {
      if (snapshot.listingId === listingId) setState(snapshot);
    };

    const onLocked = () => {
      void refreshState();
    };

    const onReleased = (payload: { listingId: string }) => {
      if (payload.listingId !== listingId) return;
      setWasReleased(true);
      void refreshState();
    };

    socket.on("connect", onConnect);
    socket.on("listing:state", onState);
    socket.on("listing:locked", onLocked);
    socket.on("listing:released", onReleased);

    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("listing:state", onState);
      socket.off("listing:locked", onLocked);
      socket.off("listing:released", onReleased);
    };
  }, [listingId, guestId, displayName, userId, ready, refreshState]);

  const attemptClaim = useCallback(
    (
      phrase: string,
      onResult: (result: {
        outcome: "won" | "lost" | "invalid";
        paymentDeadline?: number;
      }) => void
    ) => {
      const socket = getSocket();
      if (!socket?.connected || !ready) return;

      const payload: ClaimAttemptPayload = {
        listingId,
        phrase,
        guestId,
        displayName,
        userId,
      };

      let settled = false;
      const finish = (result: {
        outcome: "won" | "lost" | "invalid";
        paymentDeadline?: number;
      }) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        socket.off("claim:result", handler);
        onResult(result);
      };

      const handler = (result: {
        outcome: "won" | "lost" | "invalid";
        paymentDeadline?: number;
      }) => {
        finish(result);
      };

      const timeoutId = setTimeout(() => {
        finish({ outcome: "invalid" });
      }, 15_000);

      socket.on("claim:result", handler);
      socket.emit("claim:attempt", payload);
    },
    [listingId, guestId, displayName, userId, ready]
  );

  return {
    state,
    connected,
    ready,
    attemptClaim,
    isLocked: state?.status === "locked",
    viewers: state?.viewers ?? 0,
    isLoggedIn,
    wasReleased,
  };
}
