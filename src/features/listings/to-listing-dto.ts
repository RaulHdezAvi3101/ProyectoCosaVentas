import type { Listing as PrismaListing } from "@prisma/client";
import type { Listing, SellerTier } from "@/types/marketplace";

type ListingRow = Pick<
  PrismaListing,
  | "slug"
  | "title"
  | "description"
  | "priceCents"
  | "currency"
  | "category"
  | "condition"
  | "imageUrls"
  | "sellerId"
  | "status"
  | "firstToClaim"
  | "phraseHidden"
  | "quantity"
> & {
  seller?: {
    id: string;
    displayName: string;
    sellerProfile: {
      score: number;
      tier: string;
    } | null;
  };
};

export function toListingDto(row: ListingRow): Listing {
  const sellerProfile = row.seller?.sellerProfile;

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
    seller:
      row.seller && sellerProfile
        ? {
            id: row.seller.id,
            name: row.seller.displayName,
            score: sellerProfile.score,
            tier: sellerProfile.tier as SellerTier,
          }
        : undefined,
    status: row.status,
    firstToClaim: row.firstToClaim,
    phraseHidden: row.phraseHidden,
    quantity: row.quantity,
  };
}
