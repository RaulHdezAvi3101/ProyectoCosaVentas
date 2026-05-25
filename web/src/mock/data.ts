import type { Listing, Review, Seller, SellerTier, ListingStatus } from "@/types/marketplace";
import { DEMO_PHRASE, PLATFORM_NAME } from "@/lib/marketplace/constants";
import { SEED_CLAIM_PHRASES } from "../../prisma/seed-phrases";
import { SEED_IMAGES, SEED_LISTING_DEFS } from "@/lib/listings/seed-catalog";

export type { Listing, Review, Seller, SellerTier, ListingStatus };

export { PLATFORM_NAME, DEMO_PHRASE };
export { formatPrice } from "@/lib/marketplace/format";

export const sellers: Record<string, Seller> = {
  "seller-1": {
    id: "seller-1",
    name: "María Colecciones",
    handle: "@maria_colecciones",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    score: 942,
    tier: "elite",
    sales: 1247,
    positiveRate: 99.2,
    onTimeShipping: 97,
    memberSince: "2022",
  },
  "seller-2": {
    id: "seller-2",
    name: "Luis TCG",
    handle: "@luis_tcg",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    score: 680,
    tier: "trusted",
    sales: 312,
    positiveRate: 96.5,
    onTimeShipping: 91,
    memberSince: "2023",
  },
  "seller-3": {
    id: "seller-3",
    name: "Sofía Primeras Ventas",
    handle: "@sofia_primeras",
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    score: 0,
    tier: "nuevo",
    sales: 0,
    positiveRate: 0,
    onTimeShipping: 0,
    memberSince: "2026",
  },
  "seller-4": {
    id: "seller-4",
    name: "Raúl Outlet Riesgoso",
    handle: "@raul_outlet",
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
    score: 142,
    tier: "low",
    sales: 28,
    positiveRate: 68.4,
    onTimeShipping: 61,
    memberSince: "2024",
  },
};

const reviewImg = (url: string) =>
  url.replace("w=800", "w=400").replace("h=800", "h=400");

export const reviewsBySeller: Record<string, Review[]> = {
  "seller-1": [
    {
      id: "r1",
      buyer: "Ana G.",
      rating: 5,
      text: "Carta perfecta, empaque impecable.",
      imageUrl: reviewImg(SEED_IMAGES.cardsA),
      date: "Hace 3 días",
    },
    {
      id: "r2",
      buyer: "Carlos M.",
      rating: 5,
      text: "Envío al día siguiente. Muy recomendado.",
      imageUrl: reviewImg(SEED_IMAGES.cardsB),
      date: "Hace 1 semana",
    },
  ],
  "seller-2": [
    {
      id: "r3",
      buyer: "Diego R.",
      rating: 5,
      text: "Sneakers auténticos, tal cual las fotos.",
      imageUrl: reviewImg(SEED_IMAGES.sneakers),
      date: "Hace 5 días",
    },
  ],
  "seller-3": [],
  "seller-4": [
    {
      id: "r4",
      buyer: "Patricia L.",
      rating: 2,
      text: "Tardó más de lo prometido; el producto llegó con rayones no mencionados.",
      imageUrl: reviewImg(SEED_IMAGES.tech),
      date: "Hace 2 semanas",
    },
    {
      id: "r5",
      buyer: "Jorge H.",
      rating: 3,
      text: "Funciona, pero la descripción no coincidía del todo con el estado real.",
      imageUrl: reviewImg(SEED_IMAGES.tech),
      date: "Hace 1 mes",
    },
  ],
};

/** Reseñas por defecto (compat) — vendedor elite. */
export const reviews: Review[] = reviewsBySeller["seller-1"];

export function getReviewsForSeller(sellerId: string): Review[] {
  return reviewsBySeller[sellerId] ?? [];
}

function phraseForMock(def: (typeof SEED_LISTING_DEFS)[number]): string | undefined {
  if (!def.firstToClaim || !def.phraseKey) return undefined;
  return SEED_CLAIM_PHRASES[def.phraseKey];
}

export const listings: Listing[] = SEED_LISTING_DEFS.map((def) => ({
  id: def.slug,
  title: def.title,
  description: def.description,
  price: def.priceCents / 100,
  currency: "MXN",
  category: def.category,
  condition: def.condition,
  imageUrls: [...def.imageUrls],
  sellerId: def.sellerId,
  status: def.status,
  firstToClaim: def.firstToClaim,
  phrase: phraseForMock(def),
  phraseHidden: def.phraseHidden,
  viewers: def.viewers,
}));

export function getListing(id: string): Listing | undefined {
  return listings.find((l) => l.id === id);
}

export function getSeller(id: string): Seller | undefined {
  return sellers[id];
}
