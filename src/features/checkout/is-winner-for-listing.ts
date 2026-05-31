import { prisma } from "@/server/db";

export async function isWinnerForListing(
  listingSlug: string,
  userId: string,
): Promise<boolean> {
  const reservation = await prisma.reservation.findFirst({
    where: {
      listing: { slug: listingSlug },
      userId,
      releasedAt: null,
    },
    select: { id: true },
  });

  return Boolean(reservation);
}
