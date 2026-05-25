/**
 * @deprecated Importar desde `@/server/claim` (`getClaimStore`).
 * Re-exporta delegación async para compatibilidad.
 */
import { getClaimStore } from "@/server/claim";
import { getListingBySlug } from "@/lib/listings/queries";

export async function joinRoom(listingId: string) {
  return (await getClaimStore()).joinRoom(listingId);
}

export async function leaveRoom(listingId: string) {
  return (await getClaimStore()).leaveRoom(listingId);
}

export async function getState(listingId: string) {
  return (await getClaimStore()).getState(listingId);
}

export async function tryClaim(
  listingId: string,
  guestId: string,
  displayName: string,
  phrase: string
) {
  return (await getClaimStore()).tryClaim({
    listingId,
    guestId,
    displayName,
    phrase,
  });
}

export async function getInboxForSeller(sellerId: string) {
  return (await getClaimStore()).getInboxForSeller(sellerId);
}

export async function listingSupportsRealtime(listingId: string) {
  return (await getClaimStore()).listingSupportsRealtime(listingId);
}

export async function getListingMeta(listingId: string) {
  return getListingBySlug(listingId);
}
