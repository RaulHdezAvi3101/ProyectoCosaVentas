import type { Bundle } from "@/types/marketplace";

type BundleListingRow = {
  slug: string;
  title: string;
  priceCents: number;
  currency: string;
  category: string;
  imageUrls: string[];
};

type BundleRow = {
  slug: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  pickCount: number | null;
  status: string;
  sellerId: string;
  items: Array<{ sortOrder: number; listing: BundleListingRow }>;
};

export function toBundleDto(row: BundleRow): Bundle {
  const items = [...row.items]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ listing }) => ({
      id: listing.slug,
      title: listing.title,
      price: listing.priceCents,
      currency: listing.currency,
      category: listing.category,
      imageUrls: listing.imageUrls,
    }));

  const individualTotal = items.reduce((sum, item) => sum + item.price, 0);

  return {
    id: row.slug,
    title: row.title,
    description: row.description,
    price: row.priceCents,
    currency: row.currency,
    pickCount: row.pickCount,
    totalCount: items.length,
    individualTotal,
    savings: Math.max(0, individualTotal - row.priceCents),
    status: row.status as Bundle["status"],
    sellerId: row.sellerId,
    items,
  };
}

export const bundleSelect = {
  slug: true,
  title: true,
  description: true,
  priceCents: true,
  currency: true,
  pickCount: true,
  status: true,
  sellerId: true,
  items: {
    orderBy: { sortOrder: "asc" as const },
    select: {
      sortOrder: true,
      listing: {
        select: {
          slug: true,
          title: true,
          priceCents: true,
          currency: true,
          category: true,
          imageUrls: true,
        },
      },
    },
  },
} as const;
