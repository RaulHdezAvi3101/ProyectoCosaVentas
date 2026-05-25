import type { ClaimAttemptResult, ListingStateSnapshot } from "./marketplace";

export interface ListingJoinPayload {
  listingId: string;
  guestId?: string;
  displayName?: string;
  userId?: string;
}

export interface ClaimAttemptPayload {
  listingId: string;
  phrase: string;
  guestId: string;
  displayName: string;
  /** Sesión autenticada (prioridad sobre guest) */
  userId?: string;
}

export type ClaimResultPayload = ClaimAttemptResult;

export interface ListingLockedPayload {
  listingId: string;
  winner: {
    guestId: string;
    displayName: string;
  };
  paymentDeadline: number;
}

export interface ListingReleasedPayload {
  listingId: string;
}

export interface ServerToClientEvents {
  "listing:state": (state: ListingStateSnapshot) => void;
  "claim:result": (result: ClaimResultPayload) => void;
  "listing:locked": (payload: ListingLockedPayload) => void;
  "listing:released": (payload: ListingReleasedPayload) => void;
}

export interface ClientToServerEvents {
  "listing:join": (payload: ListingJoinPayload) => void;
  "claim:attempt": (payload: ClaimAttemptPayload) => void;
}
