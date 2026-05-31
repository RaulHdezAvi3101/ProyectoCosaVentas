const GUEST_ID_KEY = "mio_guest_id";
const GUEST_NAME_KEY = "mio_guest_name";
const CLAIM_GUEST_PREFIX = "mio_claim_guest_";

function createGuestId(): string {
  return crypto.randomUUID();
}

export function getOrCreateGuestId(): string {
  const existing = localStorage.getItem(GUEST_ID_KEY);
  if (existing) {
    return existing;
  }

  const guestId = createGuestId();
  localStorage.setItem(GUEST_ID_KEY, guestId);
  return guestId;
}

export function getGuestDisplayName(): string {
  return localStorage.getItem(GUEST_NAME_KEY)?.trim() || "Invitado";
}

export function setGuestDisplayName(displayName: string): void {
  localStorage.setItem(GUEST_NAME_KEY, displayName.trim().slice(0, 40) || "Invitado");
}

export function rememberGuestWinner(listingSlug: string, userId: string): void {
  sessionStorage.setItem(`${CLAIM_GUEST_PREFIX}${listingSlug}`, userId);
}

export function getRememberedGuestWinner(listingSlug: string): string | null {
  return sessionStorage.getItem(`${CLAIM_GUEST_PREFIX}${listingSlug}`);
}
