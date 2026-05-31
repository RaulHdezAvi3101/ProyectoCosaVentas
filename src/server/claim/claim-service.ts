import { prisma } from "@/server/db";
import { claimLockService } from "@/server/claim/ClaimLockService";
import { claimPersistence } from "@/server/claim/ClaimPersistence";
import { ListingNotLiveError } from "@/server/claim/claim-errors";
import { isClaimRateLimited } from "@/server/claim/claim-rate-limit";
import { clearWinner } from "@/server/claim/redis-runtime";
import { validateClaimPhrase } from "@/server/claim/phrase-validator";
import { getPaymentExpiredQueue } from "@/server/queue";
import type { ClaimAttemptResult } from "@/types/marketplace";
import type { ListingLockedPayload } from "@/types/socket";

export interface ProcessClaimInput {
  listingSlug: string;
  phrase: string;
  userId: string;
  displayName: string;
}

export interface ProcessClaimSuccess {
  kind: "won";
  result: ClaimAttemptResult;
  lockedPayload: ListingLockedPayload;
}

export interface ProcessClaimFailure {
  kind: "lost" | "invalid";
  result: ClaimAttemptResult;
}

export type ProcessClaimOutput = ProcessClaimSuccess | ProcessClaimFailure;

export async function processClaimAttempt(
  input: ProcessClaimInput,
): Promise<ProcessClaimOutput> {
  const listing = await prisma.listing.findUnique({
    where: { slug: input.listingSlug },
    select: {
      id: true,
      slug: true,
      status: true,
      firstToClaim: true,
      claimPhraseHash: true,
    },
  });

  if (
    !listing ||
    !listing.firstToClaim ||
    listing.status !== "live" ||
    !listing.claimPhraseHash
  ) {
    return {
      kind: "invalid",
      result: { outcome: "invalid" },
    };
  }

  const phraseValid = await validateClaimPhrase(
    input.phrase,
    listing.claimPhraseHash,
  );

  if (!phraseValid) {
    return {
      kind: "invalid",
      result: { outcome: "invalid" },
    };
  }

  if (isClaimRateLimited(input.userId, input.listingSlug)) {
    return {
      kind: "invalid",
      result: { outcome: "invalid" },
    };
  }

  const lockedAt = new Date();
  const lockPayload = {
    userId: input.userId,
    displayName: input.displayName,
    lockedAt: lockedAt.getTime(),
  };

  const lockAcquired = await claimLockService.tryAcquireWinnerLock(
    input.listingSlug,
    lockPayload,
  );

  if (!lockAcquired) {
    return {
      kind: "lost",
      result: { outcome: "lost" },
    };
  }

  try {
    const win = await claimPersistence.writeWinInTransaction({
      listingSlug: input.listingSlug,
      userId: input.userId,
      phrase: input.phrase,
      lockedAt,
    });

    const paymentDeadline = win.paymentDeadlineAt.getTime();
    const delayMs = Math.max(0, paymentDeadline - Date.now());
    const job = await getPaymentExpiredQueue().add(
      "payment-expired",
      {
        reservationId: win.reservationId,
        listingSlug: win.listingSlug,
      },
      {
        delay: delayMs,
        jobId: `payment-expired-${win.reservationId}`,
        removeOnComplete: true,
        removeOnFail: 100,
      },
    );

    if (job.id) {
      await claimPersistence.setReservationJobId(win.reservationId, job.id);
    }

    return {
      kind: "won",
      result: {
        outcome: "won",
        paymentDeadline,
      },
      lockedPayload: {
        listingId: input.listingSlug,
        winner: {
          userId: input.userId,
          displayName: input.displayName,
        },
        paymentDeadline,
      },
    };
  } catch (error) {
    await clearWinner(input.listingSlug);

    if (error instanceof ListingNotLiveError) {
      return {
        kind: "lost",
        result: { outcome: "lost" },
      };
    }

    console.error("[claim] persist failed after lock", error);
    return {
      kind: "lost",
      result: { outcome: "lost" },
    };
  }
}
