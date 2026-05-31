export type WantStatus = "active" | "fulfilled" | "closed";
export type WantOfferStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export interface WantAuthorPreview {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
}

export interface WantListItem {
  id: string;
  title: string;
  description: string;
  category: string;
  desiredCondition: string;
  targetPrice: number;
  currency: string;
  status: WantStatus;
  authorId: string;
  author?: WantAuthorPreview;
  offerCount?: number;
  createdAt: string;
}

export interface WantOffer {
  id: string;
  wantId: string;
  sellerId: string;
  seller?: WantAuthorPreview;
  listingId?: string;
  listingTitle?: string;
  price: number;
  currency: string;
  message: string;
  status: WantOfferStatus;
  createdAt: string;
}

export interface WantDetail {
  want: WantListItem;
  offers: WantOffer[];
}
