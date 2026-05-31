import type { SellerProfile, User } from "@prisma/client";
import type { Seller, SellerTier } from "@/types/marketplace";

type SellerRow = Pick<User, "id" | "displayName" | "handle" | "avatarUrl"> & {
  sellerProfile: Pick<
    SellerProfile,
    | "score"
    | "tier"
    | "sales"
    | "positiveRate"
    | "onTimeShipping"
    | "avgShipHours"
    | "responseRate"
    | "memberSince"
  >;
};

export function toSellerDto(row: SellerRow): Seller {
  return {
    id: row.id,
    name: row.displayName,
    handle: row.handle,
    avatarUrl: row.avatarUrl,
    score: row.sellerProfile.score,
    tier: row.sellerProfile.tier as SellerTier,
    sales: row.sellerProfile.sales,
    positiveRate: row.sellerProfile.positiveRate,
    onTimeShipping: row.sellerProfile.onTimeShipping,
    avgShipHours: row.sellerProfile.avgShipHours,
    responseRate: row.sellerProfile.responseRate,
    memberSince: row.sellerProfile.memberSince,
  };
}
