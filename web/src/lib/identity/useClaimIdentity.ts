"use client";

import { useGuestIdentity } from "./useGuestIdentity";
import { useSession } from "@/lib/auth/useSession";

/**
 * Identidad para Socket.io / claims: sesión si existe, si no guest (dev).
 */
export function useClaimIdentity() {
  const { user, ready: sessionReady, isLoggedIn } = useSession();
  const guest = useGuestIdentity();

  if (isLoggedIn && user && sessionReady) {
    return {
      userId: user.id,
      guestId: user.legacyGuestId ?? user.id,
      displayName: user.displayName,
      ready: true,
      isLoggedIn: true,
      user,
    };
  }

  return {
    userId: undefined as string | undefined,
    guestId: guest.guestId,
    displayName: guest.displayName,
    ready: guest.ready && sessionReady,
    isLoggedIn: false,
    user: null,
  };
}
