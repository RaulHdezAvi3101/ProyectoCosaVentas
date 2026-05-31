import type { WantListItem, WantOffer, WantAuthorPreview } from "@/types/wants";

type AuthorRow = {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl: string;
};

function toAuthorPreview(row: AuthorRow): WantAuthorPreview {
  return {
    id: row.id,
    name: row.displayName,
    handle: row.handle,
    avatarUrl: row.avatarUrl,
  };
}

type WantRow = {
  slug: string;
  title: string;
  description: string;
  category: string;
  desiredCondition: string;
  targetPriceCents: number;
  currency: string;
  status: string;
  userId: string;
  createdAt: Date;
  user?: AuthorRow;
  _count?: { offers: number };
};

export function toWantDto(row: WantRow): WantListItem {
  return {
    id: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    desiredCondition: row.desiredCondition,
    targetPrice: row.targetPriceCents,
    currency: row.currency,
    status: row.status as WantListItem["status"],
    authorId: row.userId,
    author: row.user ? toAuthorPreview(row.user) : undefined,
    offerCount: row._count?.offers,
    createdAt: row.createdAt.toISOString(),
  };
}

type OfferRow = {
  id: string;
  priceCents: number;
  message: string;
  status: string;
  createdAt: Date;
  seller: AuthorRow;
  listing?: { slug: string; title: string; currency: string } | null;
  want: { slug: string };
};

export function toWantOfferDto(row: OfferRow): WantOffer {
  return {
    id: row.id,
    wantId: row.want.slug,
    sellerId: row.seller.id,
    seller: toAuthorPreview(row.seller),
    listingId: row.listing?.slug,
    listingTitle: row.listing?.title,
    price: row.priceCents,
    currency: row.listing?.currency ?? "MXN",
    message: row.message,
    status: row.status as WantOffer["status"],
    createdAt: row.createdAt.toISOString(),
  };
}

export const wantFeedSelect = {
  slug: true,
  title: true,
  description: true,
  category: true,
  desiredCondition: true,
  targetPriceCents: true,
  currency: true,
  status: true,
  userId: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      displayName: true,
      handle: true,
      avatarUrl: true,
    },
  },
  _count: {
    select: { offers: true },
  },
} as const;

export const wantOfferSelect = {
  id: true,
  priceCents: true,
  message: true,
  status: true,
  createdAt: true,
  seller: {
    select: {
      id: true,
      displayName: true,
      handle: true,
      avatarUrl: true,
    },
  },
  listing: {
    select: {
      slug: true,
      title: true,
      currency: true,
    },
  },
  want: {
    select: { slug: true },
  },
} as const;
