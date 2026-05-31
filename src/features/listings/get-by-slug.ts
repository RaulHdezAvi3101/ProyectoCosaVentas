import { prisma } from "@/server/db";
import { toListingDto } from "@/features/listings/to-listing-dto";
import { toSellerDto } from "@/features/listings/to-seller-dto";
import type { Listing, Seller } from "@/types/marketplace";

export interface ListingDetail {
  listing: Listing;
  seller: Seller;
}

export async function getBySlug(slug: string): Promise<ListingDetail | null> {
  const row = await prisma.listing.findUnique({
    where: { slug },
    select: {
      slug: true,
      title: true,
      description: true,
      priceCents: true,
      currency: true,
      category: true,
      condition: true,
      imageUrls: true,
      sellerId: true,
      status: true,
      firstToClaim: true,
      phraseHidden: true,
      quantity: true,
      seller: {
        select: {
          id: true,
          displayName: true,
          handle: true,
          avatarUrl: true,
          sellerProfile: {
            select: {
              score: true,
              tier: true,
              sales: true,
              positiveRate: true,
              onTimeShipping: true,
              avgShipHours: true,
              responseRate: true,
              memberSince: true,
            },
          },
        },
      },
    },
  });

  if (!row?.seller.sellerProfile) {
    return null;
  }

  return {
    listing: toListingDto(row),
    seller: toSellerDto({
      id: row.seller.id,
      displayName: row.seller.displayName,
      handle: row.seller.handle,
      avatarUrl: row.seller.avatarUrl,
      sellerProfile: row.seller.sellerProfile,
    }),
  };
}
