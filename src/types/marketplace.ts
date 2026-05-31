export type ListingStatus = "draft" | "active" | "live" | "locked" | "sold";
export type RuntimeListingStatus = "live" | "locked" | "sold";

export interface ListingSellerPreview {
  id: string;
  name: string;
  score: number;
  tier: SellerTier;
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
  seller?: ListingSellerPreview;
  status: ListingStatus;
  firstToClaim: boolean;
  phrase?: string;
  phraseHidden?: boolean;
  quantity?: number;
  viewers?: number;
}

export type SellerTier =
  | "nuevo"
  | "low"
  | "verificado"
  | "trusted"
  | "elite";

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
  avgShipHours: number;
  responseRate: number;
  memberSince: string;
}

export type BundleStatus = "draft" | "active" | "sold" | "archived";

export interface BundleListingItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  category: string;
  imageUrls: string[];
}

export interface Bundle {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  pickCount: number | null;
  totalCount: number;
  individualTotal: number;
  savings: number;
  status: BundleStatus;
  sellerId: string;
  items: BundleListingItem[];
}

export interface ListingStateSnapshot {
  listingId: string;
  status: RuntimeListingStatus;
  viewers: number;
  winner?: {
    userId: string;
    displayName: string;
    lockedAt: number;
  };
  paymentDeadline?: number;
}

export interface ClaimAttemptResult {
  outcome: "won" | "lost" | "invalid";
  paymentDeadline?: number;
}

export interface InboxChat {
  id: string;
  userId: string;
  name: string;
  preview: string;
  listingId: string;
  imageUrl?: string;
  status: "winner" | "late";
  paymentDeadline?: number;
  paymentExpired?: boolean;
}

export interface HealthResponse {
  ok: boolean;
  db?: "up" | "down";
  redis?: "up" | "down";
}
