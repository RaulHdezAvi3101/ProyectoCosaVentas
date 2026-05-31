import { prisma } from "@/server/db";
import { getWinner, setWinner } from "@/server/claim/redis-runtime";

export async function reconcileRedisFromPostgres(): Promise<number> {
  const activeReservations = await prisma.reservation.findMany({
    where: { releasedAt: null },
    include: {
      listing: { select: { slug: true, status: true } },
      user: { select: { id: true, displayName: true } },
    },
  });

  let restored = 0;

  for (const reservation of activeReservations) {
    if (reservation.listing.status !== "locked") {
      continue;
    }

    const existing = await getWinner(reservation.listing.slug);
    if (existing) {
      continue;
    }

    await setWinner(reservation.listing.slug, {
      userId: reservation.user.id,
      displayName: reservation.user.displayName,
      lockedAt: reservation.lockedAt.getTime(),
    });
    restored += 1;
  }

  return restored;
}
