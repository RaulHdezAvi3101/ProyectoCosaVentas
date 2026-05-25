export type ListingStatus = "active" | "live" | "locked";

export type SellerTier = "nuevo" | "low" | "verificado" | "trusted" | "elite";

export interface Seller {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  score: number;
  tier: SellerTier;
  sales: number;
  positiveRate: number;
  onTimeShipping: number;
  memberSince: string;
}

export interface Review {
  id: string;
  buyer: string;
  rating: number;
  text: string;
  imageUrl: string;
  date: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  condition: string;
  imageUrls: string[];
  sellerId: string;
  status: ListingStatus;
  firstToClaim: boolean;
  phrase?: string;
  phraseHidden?: boolean;
  viewers?: number;
}

export type RuntimeListingStatus = "live" | "locked";

export interface ListingWinner {
  guestId: string;
  displayName: string;
  lockedAt: number;
}

export interface ListingStateSnapshot {
  listingId: string;
  status: RuntimeListingStatus;
  viewers: number;
  winner?: ListingWinner;
  paymentDeadline?: number;
}

export type ClaimOutcome = "won" | "lost" | "invalid";

export interface ClaimAttemptResult {
  outcome: ClaimOutcome;
  paymentDeadline?: number;
}

export interface InboxChat {
  id: string;
  guestId: string;
  name: string;
  preview: string;
  listingId: string;
  status: "winner" | "late";
  paymentDeadline?: number;
  /** Ganador no pagó a tiempo; listing volvió a LIVE */
  paymentExpired?: boolean;
}
