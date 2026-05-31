import { prisma } from "@/server/db";
import { clearWinner } from "@/server/claim/redis-runtime";
import { buildListingStateSnapshot, listingRoomName } from "@/server/claim/listing-state";
import { getIo } from "@/server/socket/io-instance";

export async function releaseReservationById(
  reservationId: string,
): Promise<{ listingSlug: string } | null> {
  const result = await prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.findUnique({
      where: { id: reservationId },
      include: {
        listing: { select: { id: true, slug: true, status: true } },
      },
    });

    if (!reservation || reservation.releasedAt) {
      return null;
    }

    const releasedAt = new Date();

    await tx.reservation.update({
      where: { id: reservation.id },
      data: { releasedAt },
    });

    await tx.order.updateMany({
      where: {
        reservationId: reservation.id,
        status: "pending",
      },
      data: { status: "expired" },
    });

    if (reservation.listing.status === "locked") {
      await tx.listing.update({
        where: { id: reservation.listing.id },
        data: { status: "active" },
      });
    }

    return { listingSlug: reservation.listing.slug };
  });

  if (!result) {
    return null;
  }

  await clearWinner(result.listingSlug);

  const io = getIo();
  const room = listingRoomName(result.listingSlug);
  io.to(room).emit("listing:released", { listingId: result.listingSlug });

  const snapshot = await buildListingStateSnapshot(result.listingSlug);
  if (snapshot) {
    io.to(room).emit("listing:state", snapshot);
  }

  return result;
}
