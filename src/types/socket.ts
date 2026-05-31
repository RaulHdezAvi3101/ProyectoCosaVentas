import type {
  ClaimAttemptResult,
  ListingStateSnapshot,
  RuntimeListingStatus,
} from "./marketplace";

export interface ListingJoinPayload {
  listingId: string;
}

export interface ClaimAttemptPayload {
  listingId: string;
  phrase: string;
}

export interface ListingLockedPayload {
  listingId: string;
  winner: {
    userId: string;
    displayName: string;
  };
  paymentDeadline: number;
}

export interface ListingReleasedPayload {
  listingId: string;
}

export interface ClientToServerEvents {
  "listing:join": (payload: ListingJoinPayload) => void;
  "claim:attempt": (payload: ClaimAttemptPayload) => void;
}

export interface ServerToClientEvents {
  "listing:state": (snapshot: ListingStateSnapshot) => void;
  "claim:result": (result: ClaimAttemptResult) => void;
  "listing:locked": (payload: ListingLockedPayload) => void;
  "listing:released": (payload: ListingReleasedPayload) => void;
}

export type { RuntimeListingStatus };
