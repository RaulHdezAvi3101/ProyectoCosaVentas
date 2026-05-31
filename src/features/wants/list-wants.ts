import { prisma } from "@/server/db";
import {
  toWantDto,
  toWantOfferDto,
  wantFeedSelect,
  wantOfferSelect,
} from "@/features/wants/to-want-dto";
import type { WantDetail, WantListItem } from "@/types/wants";

export interface ListWantsOptions {
  page?: number;
  pageSize?: number;
  category?: string;
}

export interface ListWantsResult {
  items: WantListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export async function listWants(
  options: ListWantsOptions = {},
): Promise<ListWantsResult> {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, options.pageSize ?? 16));
  const skip = (page - 1) * pageSize;

  const where = {
    status: "active" as const,
    ...(options.category ? { category: options.category } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.wantListItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: wantFeedSelect,
    }),
    prisma.wantListItem.count({ where }),
  ]);

  return {
    items: rows.map(toWantDto),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getWantBySlug(slug: string): Promise<WantDetail | null> {
  const row = await prisma.wantListItem.findUnique({
    where: { slug },
    select: {
      ...wantFeedSelect,
      offers: {
        orderBy: { createdAt: "desc" },
        select: wantOfferSelect,
      },
    },
  });

  if (!row || row.status === "closed") {
    return null;
  }

  return {
    want: toWantDto(row),
    offers: row.offers.map(toWantOfferDto),
  };
}

export async function getWantOfferCount(slug: string): Promise<number> {
  const want = await prisma.wantListItem.findUnique({
    where: { slug },
    select: { _count: { select: { offers: true } } },
  });

  return want?._count.offers ?? 0;
}
