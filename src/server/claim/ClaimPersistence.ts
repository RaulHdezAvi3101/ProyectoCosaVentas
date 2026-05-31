import { prisma } from "@/server/db";
import { ListingNotLiveError } from "@/server/claim/claim-errors";
import { getPaymentWindowMs } from "@/server/claim/config";
import { buildPhrasePreview } from "@/server/claim/phrase-validator";

export interface WriteWinInput {
  listingSlug: string;
  userId: string;
  phrase: string;
  lockedAt: Date;
}

export interface WriteWinResult {
  reservationId: string;
  listingSlug: string;
  paymentDeadlineAt: Date;
}

export class ClaimPersistence {
  async writeWinInTransaction(input: WriteWinInput): Promise<WriteWinResult> {
    const paymentWindowMs = getPaymentWindowMs();
    const phrasePreview = buildPhrasePreview(input.phrase);

    return prisma.$transaction(async (tx) => {
      const listing = await tx.listing.findUnique({
        where: { slug: input.listingSlug },
        select: {
          id: true,
          status: true,
        },
      });

      if (!listing || listing.status !== "live") {
        throw new ListingNotLiveError();
      }

      const paymentDeadlineAt = new Date(
        input.lockedAt.getTime() + paymentWindowMs,
      );

      await tx.listing.update({
        where: { id: listing.id },
        data: { status: "locked" },
      });

      await tx.claimAttempt.create({
        data: {
          listingId: listing.id,
          userId: input.userId,
          phrasePreview,
          isWinner: true,
        },
      });

      const reservation = await tx.reservation.upsert({
        where: { listingId: listing.id },
        update: {
          userId: input.userId,
          lockedAt: input.lockedAt,
          paymentDeadlineAt,
          releasedAt: null,
          bullJobId: null,
        },
        create: {
          listingId: listing.id,
          userId: input.userId,
          lockedAt: input.lockedAt,
          paymentDeadlineAt,
        },
      });

      await tx.order.upsert({
        where: { reservationId: reservation.id },
        update: {
          status: "pending",
          paidAt: null,
        },
        create: {
          reservationId: reservation.id,
          status: "pending",
        },
      });

      return {
        reservationId: reservation.id,
        listingSlug: input.listingSlug,
        paymentDeadlineAt,
      };
    });
  }

  async setReservationJobId(
    reservationId: string,
    bullJobId: string,
  ): Promise<void> {
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { bullJobId },
    });
  }
}

export const claimPersistence = new ClaimPersistence();
