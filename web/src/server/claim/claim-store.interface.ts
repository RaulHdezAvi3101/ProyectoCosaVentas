import type {
  ClaimAttemptResult,
  InboxChat,
  ListingStateSnapshot,
} from "@/types/marketplace";

export interface TryClaimInput {
  listingId: string;
  guestId: string;
  displayName: string;
  phrase: string;
  userId?: string;
}

export interface ClaimStore {
  joinRoom(listingId: string): Promise<ListingStateSnapshot | null>;
  leaveRoom(listingId: string): Promise<void>;
  getState(listingId: string): Promise<ListingStateSnapshot | null>;
  tryClaim(input: TryClaimInput): Promise<ClaimAttemptResult>;
  getInboxForSeller(sellerId: string): Promise<InboxChat[]>;
  listingSupportsRealtime(listingId: string): Promise<boolean>;
}
