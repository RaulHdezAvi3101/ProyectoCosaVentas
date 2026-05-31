import { prisma } from "@/server/db";
import { bundleSelect, toBundleDto } from "@/features/bundles/to-bundle-dto";
import type { Bundle } from "@/types/marketplace";

export async function getBundleBySlug(slug: string): Promise<Bundle | null> {
  const row = await prisma.bundle.findUnique({
    where: { slug },
    select: bundleSelect,
  });

  if (!row || row.status !== "active") {
    return null;
  }

  return toBundleDto(row);
}

export async function listSellerBundles(
  sellerId: string,
): Promise<Bundle[]> {
  const rows = await prisma.bundle.findMany({
    where: { sellerId, status: "active" },
    orderBy: { createdAt: "desc" },
    select: bundleSelect,
  });

  return rows.map(toBundleDto);
}
