import { LISTING_CATEGORIES } from "@/lib/camera/constants";
import { prisma } from "@/server/db";

export interface SellerCategoryCount {
  category: string;
  count: number;
}

export async function getSellerCategoryCounts(
  sellerId: string,
): Promise<SellerCategoryCount[]> {
  const groups = await prisma.listing.groupBy({
    by: ["category"],
    where: {
      sellerId,
      status: { in: ["active", "live"] },
    },
    _count: { category: true },
  });

  const countByCategory = new Map(
    groups.map((g) => [g.category, g._count.category]),
  );

  return LISTING_CATEGORIES.map((category) => ({
    category,
    count: countByCategory.get(category) ?? 0,
  })).filter((entry) => entry.count > 0);
}
