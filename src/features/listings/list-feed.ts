import { prisma } from "@/server/db";
import { listingFeedSelect } from "@/features/listings/listing-feed-select";
import { toListingDto } from "@/features/listings/to-listing-dto";
import type { Listing } from "@/types/marketplace";

const FEED_STATUSES = ["active", "live"] as const;

export interface ListFeedOptions {
  page?: number;
  pageSize?: number;
  sellerId?: string;
  category?: string;
}

export interface ListFeedResult {
  items: Listing[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export async function listFeed(
  options: ListFeedOptions = {},
): Promise<ListFeedResult> {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, options.pageSize ?? 12));
  const skip = (page - 1) * pageSize;

  const where = {
    status: { in: [...FEED_STATUSES] },
    ...(options.sellerId ? { sellerId: options.sellerId } : {}),
    ...(options.category ? { category: options.category } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: [{ status: "desc" }, { createdAt: "desc" }],
      skip,
      take: pageSize,
      select: listingFeedSelect,
    }),
    prisma.listing.count({ where }),
  ]);

  return {
    items: rows.map(toListingDto),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
