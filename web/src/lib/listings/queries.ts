import type {
  Listing,
  ListingStatus,
  Review,
  Seller,
  SellerTier,
} from "@/types/marketplace";
import type { ListingStatus as DbListingStatus, User } from "@prisma/client";
import { SEED_CLAIM_PHRASES } from "../../../prisma/seed-phrases";
import {
  getListing as getMockListing,
  getReviewsForSeller as getMockReviewsForSeller,
  getSeller as getMockSeller,
  listings as mockListings,
} from "@/mock/data";
import { prisma } from "@/server/db";

const SELLER_TIERS: readonly SellerTier[] = [
  "nuevo",
  "low",
  "verificado",
  "trusted",
  "elite",
];

function parseSellerTier(tier: string | null | undefined): SellerTier {
  if (tier && (SELLER_TIERS as readonly string[]).includes(tier)) {
    return tier as SellerTier;
  }
  return "nuevo";
}

type ListingWithSeller = {
  slug: string;
  sellerId: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  category: string;
  condition: string;
  imageUrls: string[];
  status: DbListingStatus;
  firstToClaim: boolean;
  phraseHidden: boolean;
  seller: User & { sellerProfile: { score: number; tier: string; sales: number; positiveRate: number; onTimeShipping: number; memberSince: string } | null };
};

let dbAvailableCache: boolean | null = null;

function mapDbStatus(status: DbListingStatus): ListingStatus {
  switch (status) {
    case "live":
    case "locked":
    case "active":
      return status;
    case "sold":
      return "locked";
    default:
      return "active";
  }
}

/** Frase en texto plano solo para listings del seed (demo); el resto va hasheado en BD. */
function resolveSeedPhrase(slug: string, firstToClaim: boolean, phraseHidden: boolean) {
  if (!firstToClaim || phraseHidden) return undefined;
  return SEED_CLAIM_PHRASES[slug];
}

function mapDbListing(row: ListingWithSeller): Listing {
  const phrase = resolveSeedPhrase(row.slug, row.firstToClaim, row.phraseHidden);

  return {
    id: row.slug,
    title: row.title,
    description: row.description,
    price: row.priceCents / 100,
    currency: row.currency,
    category: row.category,
    condition: row.condition,
    imageUrls: row.imageUrls,
    sellerId: row.sellerId,
    status: mapDbStatus(row.status),
    firstToClaim: row.firstToClaim,
    phrase,
    phraseHidden: row.phraseHidden,
  };
}

function mapDbSeller(user: ListingWithSeller["seller"]): Seller {
  const profile = user.sellerProfile;
  return {
    id: user.id,
    name: user.displayName,
    handle: user.handle,
    avatarUrl:
      user.avatarUrl ??
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
    score: profile?.score ?? 0,
    tier: parseSellerTier(profile?.tier),
    sales: profile?.sales ?? 0,
    positiveRate: profile?.positiveRate ?? 0,
    onTimeShipping: profile?.onTimeShipping ?? 0,
    memberSince: profile?.memberSince ?? "2024",
  };
}

export async function isDatabaseAvailable(): Promise<boolean> {
  if (process.env.DATA_SOURCE === "mock") return false;
  if (!process.env.DATABASE_URL) return false;
  if (dbAvailableCache !== null) return dbAvailableCache;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbAvailableCache = true;
  } catch {
    dbAvailableCache = false;
  }
  return dbAvailableCache;
}

const listingInclude = {
  seller: { include: { sellerProfile: true } },
} as const;

export async function getListings(): Promise<Listing[]> {
  if (!(await isDatabaseAvailable())) {
    return mockListings;
  }

  const rows = await prisma.listing.findMany({
    where: { status: { in: ["active", "live", "locked"] } },
    include: listingInclude,
    orderBy: { createdAt: "asc" },
  });

  return rows.map((row) => mapDbListing(row as ListingWithSeller));
}

export async function getListingBySlug(slug: string): Promise<Listing | undefined> {
  if (!(await isDatabaseAvailable())) {
    return getMockListing(slug);
  }

  const row = await prisma.listing.findUnique({
    where: { slug },
    include: listingInclude,
  });

  if (!row) return undefined;
  return mapDbListing(row as ListingWithSeller);
}

export async function getSellerById(id: string): Promise<Seller | undefined> {
  const map = await getSellersByIds([id]);
  return map.get(id);
}

export async function getSellersByIds(ids: string[]): Promise<Map<string, Seller>> {
  const unique = Array.from(new Set(ids));
  const map = new Map<string, Seller>();
  if (unique.length === 0) return map;

  if (!(await isDatabaseAvailable())) {
    for (const id of unique) {
      const seller = getMockSeller(id);
      if (seller) map.set(id, seller);
    }
    return map;
  }

  const users = await prisma.user.findMany({
    where: { id: { in: unique } },
    include: { sellerProfile: true },
  });

  for (const user of users) {
    map.set(user.id, mapDbSeller(user as ListingWithSeller["seller"]));
  }
  return map;
}

/** Reseñas por vendedor (mock hasta exista modelo Review en Prisma). */
export async function getReviewsForSeller(sellerId: string): Promise<Review[]> {
  return getMockReviewsForSeller(sellerId);
}
