import bcrypt from "bcryptjs";
import { ListingStatus } from "@prisma/client";
import { prisma } from "@/server/db";
import type {
  InboxChat,
  ListingStateSnapshot,
  RuntimeListingStatus,
} from "@/types/marketplace";
import { getPaymentWindowMs } from "./constants";
import type { WinnerCache } from "./redis-runtime";
import { normalizePhrase, phrasePreview } from "./utils";
const listingInclude = {
  reservations: {
    where: { releasedAt: null },
    include: { winner: true },
    take: 1,
  },
} as const;

export async function findClaimListing(slug: string) {
  return prisma.listing.findUnique({
    where: { slug },
    include: listingInclude,
  });
}

export async function listingSupportsFtc(slug: string): Promise<boolean> {
  const listing = await prisma.listing.findUnique({
    where: { slug },
    select: { firstToClaim: true, claimPhraseHash: true },
  });
  return Boolean(listing?.firstToClaim && listing.claimPhraseHash);
}

export async function ensureClaimUser(
  guestId: string,
  displayName: string,
  explicitUserId?: string
): Promise<{ userId: string; guestId: string; displayName: string }> {
  if (explicitUserId) {
    const user = await prisma.user.findUnique({ where: { id: explicitUserId } });
    if (user) {
      return {
        userId: user.id,
        guestId: guestId || user.id,
        displayName: user.displayName,
      };
    }
  }

  const userId = guestId.startsWith("guest-") ? guestId : `guest-${guestId}`;
  const email = `${userId}@guest.local.dev`;

  const user = await prisma.user.upsert({
    where: { id: userId },
    update: { displayName },
    create: {
      id: userId,
      email,
      passwordHash: await bcrypt.hash(`guest:${userId}`, 4),
      displayName,
      handle: `@${userId.replace(/[^a-z0-9]/gi, "").slice(0, 16)}`,
    },
  });

  return { userId: user.id, guestId: userId, displayName: user.displayName };
}

export function reservationToWinner(
  reservation: {
    lockedAt: Date;
    paymentDeadlineAt: Date;
    winner: { id: string; displayName: string };
  }
): WinnerCache {
  return {
    userId: reservation.winner.id,
    guestId: reservation.winner.id,
    displayName: reservation.winner.displayName,
    lockedAt: reservation.lockedAt.getTime(),
  };
}

export async function buildSnapshotFromDb(
  slug: string,
  viewers: number,
  winnerCache: WinnerCache | null
): Promise<ListingStateSnapshot | null> {
  const listing = await findClaimListing(slug);
  if (!listing?.firstToClaim || !listing.claimPhraseHash) return null;

  const reservation = listing.reservations[0] ?? null;
  const winner =
    winnerCache ??
    (reservation ? reservationToWinner(reservation) : null);

  const isLocked =
    listing.status === ListingStatus.locked || Boolean(winner);

  const status: RuntimeListingStatus = isLocked ? "locked" : "live";
  const paymentWindow = getPaymentWindowMs();
  const paymentDeadline = winner
    ? (reservation?.paymentDeadlineAt.getTime() ??
      winner.lockedAt + paymentWindow)
    : undefined;

  return {
    listingId: slug,
    status,
    viewers,
    winner: winner
      ? {
          guestId: winner.guestId,
          displayName: winner.displayName,
          lockedAt: winner.lockedAt,
        }
      : undefined,
    paymentDeadline,
  };
}

export async function recordClaimAttempt(
  listingDbId: string,
  userId: string,
  preview: string,
  isWinner: boolean
) {
  const existing = await prisma.claimAttempt.findFirst({
    where: { listingId: listingDbId, userId },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    return prisma.claimAttempt.update({
      where: { id: existing.id },
      data: { phrasePreview: preview, isWinner },
    });
  }

  return prisma.claimAttempt.create({
    data: {
      listingId: listingDbId,
      userId,
      phrasePreview: preview,
      isWinner,
    },
  });
}

export async function persistWin(
  listingDbId: string,
  listingSlug: string,
  userId: string,
  preview: string,
  lockedAt: number
): Promise<{
  paymentDeadline: number;
  reservationId: string;
  listingSlug: string;
}> {
  const paymentWindow = getPaymentWindowMs();
  const lockedAtDate = new Date(lockedAt);
  const paymentDeadlineAt = new Date(lockedAt + paymentWindow);

  const reservationId = await prisma.$transaction(async (tx) => {
    await tx.listing.update({
      where: { id: listingDbId },
      data: { status: ListingStatus.locked },
    });

    const existingAttempt = await tx.claimAttempt.findFirst({
      where: { listingId: listingDbId, userId },
    });
    if (existingAttempt) {
      await tx.claimAttempt.update({
        where: { id: existingAttempt.id },
        data: { phrasePreview: preview, isWinner: true },
      });
    } else {
      await tx.claimAttempt.create({
        data: {
          listingId: listingDbId,
          userId,
          phrasePreview: preview,
          isWinner: true,
        },
      });
    }

    const reservation = await tx.reservation.upsert({
      where: { listingId: listingDbId },
      create: {
        listingId: listingDbId,
        winnerId: userId,
        lockedAt: lockedAtDate,
        paymentDeadlineAt,
      },
      update: {
        winnerId: userId,
        lockedAt: lockedAtDate,
        paymentDeadlineAt,
        releasedAt: null,
        bullJobId: null,
      },
    });

    await tx.order.upsert({
      where: { reservationId: reservation.id },
      create: {
        reservationId: reservation.id,
        status: "pending",
      },
      update: {
        status: "pending",
        paidAt: null,
      },
    });

    return reservation.id;
  });

  return {
    paymentDeadline: paymentDeadlineAt.getTime(),
    reservationId,
    listingSlug,
  };
}

export async function validatePhrase(
  claimPhraseHash: string,
  phrase: string
): Promise<boolean> {
  return bcrypt.compare(normalizePhrase(phrase), claimPhraseHash);
}

export async function getInboxFromDb(sellerId: string): Promise<InboxChat[]> {
  const attempts = await prisma.claimAttempt.findMany({
    where: {
      listing: { sellerId, firstToClaim: true },
    },
    include: {
      listing: {
        select: { slug: true, status: true },
      },
      user: { select: { id: true, displayName: true } },
    },
    orderBy: [{ isWinner: "desc" }, { createdAt: "desc" }],
  });

  const listingIds = Array.from(
    new Set(attempts.map((a) => a.listingId))
  );
  const reservations =
    listingIds.length > 0
      ? await prisma.reservation.findMany({
          where: { listingId: { in: listingIds } },
        })
      : [];
  const reservationByListingId = new Map(
    reservations.map((r) => [r.listingId, r])
  );

  return attempts.map((attempt) => {
    const reservation = reservationByListingId.get(attempt.listingId);
    const paymentDeadline = reservation?.paymentDeadlineAt.getTime();
    const paymentExpired = Boolean(
      attempt.isWinner &&
        reservation?.releasedAt &&
        attempt.listing.status === ListingStatus.live
    );

    return {
      id: attempt.id,
      guestId: attempt.user.id,
      name: attempt.user.displayName,
      preview: attempt.phrasePreview,
      listingId: attempt.listing.slug,
      status: attempt.isWinner ? ("winner" as const) : ("late" as const),
      paymentDeadline: paymentExpired ? undefined : paymentDeadline,
      paymentExpired,
    };
  });
}

export async function findLockedListingsForReconcile() {
  return prisma.listing.findMany({
    where: {
      status: ListingStatus.locked,
      firstToClaim: true,
    },
    include: {
      reservations: {
        where: { releasedAt: null },
        include: { winner: true },
        take: 1,
      },
    },
  });
}

export { phrasePreview };
