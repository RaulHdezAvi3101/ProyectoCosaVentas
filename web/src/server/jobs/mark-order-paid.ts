import { prisma } from "@/server/db";
import { cancelPaymentExpiredJob } from "./schedule-payment-expired";

/** Marca pedido pagado por slug de listing (checkout). */
export async function markOrderPaidByListingSlug(
  listingSlug: string
): Promise<{ ok: boolean; error?: string }> {
  const listing = await prisma.listing.findUnique({
    where: { slug: listingSlug },
    include: {
      reservations: {
        where: { releasedAt: null },
        take: 1,
      },
    },
  });

  const reservation = listing?.reservations[0];
  if (!reservation) {
    return { ok: false, error: "No hay reserva activa para este listing" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.upsert({
      where: { reservationId: reservation.id },
      create: {
        reservationId: reservation.id,
        status: "paid",
        paidAt: new Date(),
      },
      update: {
        status: "paid",
        paidAt: new Date(),
      },
    });
  });

  await cancelPaymentExpiredJob(reservation.id);
  return { ok: true };
}
