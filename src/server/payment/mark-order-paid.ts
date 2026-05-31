import { prisma } from "@/server/db";
import { clearWinner } from "@/server/claim/redis-runtime";
import {
  buildListingStateSnapshot,
  listingRoomName,
} from "@/server/claim/listing-state";
import { getIo } from "@/server/socket/io-instance";
import { getPaymentExpiredQueue } from "@/server/queue";
import {
  CheckoutNotFoundError,
  OrderNotPayableError,
  PaymentExpiredError,
} from "@/server/payment/errors";

export interface MarkOrderPaidInput {
  listingSlug: string;
  winnerId: string;
  idempotencyKey: string;
}

export interface MarkOrderPaidResult {
  listingSlug: string;
  paidAt: number;
  alreadyPaid: boolean;
}

export async function markOrderPaid(
  input: MarkOrderPaidInput,
): Promise<MarkOrderPaidResult> {
  const txResult = await prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.findFirst({
      where: {
        listing: { slug: input.listingSlug },
        userId: input.winnerId,
        releasedAt: null,
      },
      select: {
        id: true,
        paymentDeadlineAt: true,
        bullJobId: true,
        listing: {
          select: { id: true, slug: true, status: true },
        },
      },
    });

    if (!reservation) {
      throw new CheckoutNotFoundError();
    }

    const order = await tx.order.findUnique({
      where: { reservationId: reservation.id },
      select: {
        id: true,
        status: true,
        paidAt: true,
        idempotencyKey: true,
      },
    });

    if (!order) {
      throw new CheckoutNotFoundError();
    }

    if (order.status === "paid" && order.paidAt) {
      return {
        listingSlug: reservation.listing.slug,
        paidAt: order.paidAt.getTime(),
        alreadyPaid: true,
        bullJobId: reservation.bullJobId,
      };
    }

    if (order.status !== "pending") {
      throw new OrderNotPayableError();
    }

    if (reservation.paymentDeadlineAt.getTime() <= Date.now()) {
      throw new PaymentExpiredError();
    }

    const paidAt = new Date();

    const updated = await tx.order.updateMany({
      where: {
        id: order.id,
        status: "pending",
      },
      data: {
        status: "paid",
        paidAt,
        idempotencyKey: input.idempotencyKey,
      },
    });

    if (updated.count === 0) {
      const current = await tx.order.findUnique({
        where: { id: order.id },
        select: { status: true, paidAt: true },
      });

      if (current?.status === "paid" && current.paidAt) {
        return {
          listingSlug: reservation.listing.slug,
          paidAt: current.paidAt.getTime(),
          alreadyPaid: true,
          bullJobId: reservation.bullJobId,
        };
      }

      throw new OrderNotPayableError();
    }

    if (reservation.listing.status === "locked") {
      await tx.listing.update({
        where: { id: reservation.listing.id },
        data: { status: "sold" },
      });
    }

    return {
      listingSlug: reservation.listing.slug,
      paidAt: paidAt.getTime(),
      alreadyPaid: false,
      bullJobId: reservation.bullJobId,
    };
  });

  if (!txResult.alreadyPaid) {
    await clearWinner(txResult.listingSlug);

    if (txResult.bullJobId) {
      try {
        await getPaymentExpiredQueue().remove(txResult.bullJobId);
      } catch (error) {
        console.warn("[payment] could not remove expiry job", error);
      }
    }
  }

  const io = getIo();
  const room = listingRoomName(txResult.listingSlug);
  const snapshot = await buildListingStateSnapshot(txResult.listingSlug);

  if (snapshot) {
    io.to(room).emit("listing:state", snapshot);
  }

  return {
    listingSlug: txResult.listingSlug,
    paidAt: txResult.paidAt,
    alreadyPaid: txResult.alreadyPaid,
  };
}
