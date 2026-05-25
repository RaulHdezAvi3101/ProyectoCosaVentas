import { ListingStatus } from "@prisma/client";
import { getClaimStore } from "@/server/claim";
import { prisma } from "@/server/db";
import { redisClaimRuntime } from "@/server/claim/redis-runtime";
import { getSocketIo, listingRoomId } from "@/server/socket-io";

/**
 * Libera un listing si la reserva sigue activa y el pedido no está pagado.
 * @returns true si se liberó
 */
export async function releaseListingIfUnpaid(
  reservationId: string
): Promise<boolean> {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      listing: { select: { id: true, slug: true, status: true } },
    },
  });

  if (!reservation || reservation.releasedAt) {
    return false;
  }

  const order = await prisma.order.findUnique({
    where: { reservationId },
  });

  if (order?.status === "paid") {
    return false;
  }

  const slug = reservation.listing.slug;

  await prisma.$transaction(async (tx) => {
    await tx.listing.update({
      where: { id: reservation.listingId },
      data: { status: ListingStatus.live },
    });
    await tx.reservation.update({
      where: { id: reservationId },
      data: { releasedAt: new Date() },
    });
    if (order) {
      await tx.order.update({
        where: { id: order.id },
        data: { status: "cancelled" },
      });
    }
  });

  await redisClaimRuntime.clearWinner(slug);

  const io = getSocketIo();
  const store = await getClaimStore();
  const state = await store.getState(slug);

  if (io) {
    io.to(listingRoomId(slug)).emit("listing:released", { listingId: slug });
    if (state) {
      io.to(listingRoomId(slug)).emit("listing:state", state);
    }
  }

  console.log(`[jobs] Listing ${slug} released (payment window expired)`);
  return true;
}
