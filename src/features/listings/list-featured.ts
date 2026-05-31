import { prisma } from "@/server/db";
import { listingFeedSelect } from "@/features/listings/listing-feed-select";
import { toListingDto } from "@/features/listings/to-listing-dto";
import type { Listing } from "@/types/marketplace";

/**
 * Productos destacados para el carrusel de /explore.
 * TODO: reemplazar con lógica de curación (admin, algoritmo, campañas).
 */
export async function listFeatured(limit = 6): Promise<Listing[]> {
  const rows = await prisma.listing.findMany({
    where: {
      status: { in: ["live", "active"] },
    },
    orderBy: [{ status: "desc" }, { updatedAt: "desc" }],
    take: limit,
    select: listingFeedSelect,
  });

  return rows.map(toListingDto);
}
