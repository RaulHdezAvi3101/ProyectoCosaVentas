import { prisma } from "@/server/db";
import type { ListingStateSnapshot, RuntimeListingStatus } from "@/types/marketplace";
import { getViewers, getWinner } from "@/server/claim/redis-runtime";

function toRuntimeStatus(status: string): RuntimeListingStatus | null {
  if (status === "live" || status === "locked" || status === "sold") {
    return status;
  }

  return null;
}

export async function buildListingStateSnapshot(
  listingSlug: string,
): Promise<ListingStateSnapshot | null> {
  const listing = await prisma.listing.findUnique({
    where: { slug: listingSlug },
    select: {
      slug: true,
      status: true,
      reservation: {
        select: {
          paymentDeadlineAt: true,
          releasedAt: true,
          user: {
            select: {
              id: true,
              displayName: true,
            },
          },
          lockedAt: true,
        },
      },
    },
  });

  if (!listing) {
    return null;
  }

  const runtimeStatus = toRuntimeStatus(listing.status);
  if (!runtimeStatus) {
    return null;
  }

  const viewers = await getViewers(listingSlug);
  const redisWinner = await getWinner(listingSlug);
  const activeReservation =
    listing.reservation && !listing.reservation.releasedAt
      ? listing.reservation
      : null;

  const winnerFromDb = activeReservation
    ? {
        userId: activeReservation.user.id,
        displayName: activeReservation.user.displayName,
        lockedAt: activeReservation.lockedAt.getTime(),
      }
    : undefined;

  const winner = redisWinner
    ? {
        userId: redisWinner.userId,
        displayName: redisWinner.displayName,
        lockedAt: redisWinner.lockedAt,
      }
    : winnerFromDb;

  const paymentDeadline = activeReservation
    ? activeReservation.paymentDeadlineAt.getTime()
    : undefined;

  return {
    listingId: listing.slug,
    status: runtimeStatus,
    viewers,
    winner,
    paymentDeadline,
  };
}

export function listingRoomName(listingSlug: string): string {
  return `listing:${listingSlug}`;
}
