import { prisma } from "@/server/db";
import { releaseListingIfUnpaid } from "./release-listing";
import { schedulePaymentExpiredJob } from "./schedule-payment-expired";

/** Reprograma o ejecuta jobs tras reinicio del servidor. */
export async function reconcilePaymentExpiredJobs(): Promise<void> {
  const reservations = await prisma.reservation.findMany({
    where: { releasedAt: null },
    include: {
      listing: { select: { slug: true, status: true } },
    },
  });

  const now = Date.now();

  for (const reservation of reservations) {
    const order = await prisma.order.findUnique({
      where: { reservationId: reservation.id },
    });
    if (order?.status === "paid") continue;

    const remaining =
      reservation.paymentDeadlineAt.getTime() - now;

    if (remaining <= 0) {
      await releaseListingIfUnpaid(reservation.id);
      continue;
    }

    await schedulePaymentExpiredJob({
      reservationId: reservation.id,
      listingSlug: reservation.listing.slug,
    });
  }

  console.log(
    `[jobs] Reconciled ${reservations.length} payment-expired reservation(s)`
  );
}
