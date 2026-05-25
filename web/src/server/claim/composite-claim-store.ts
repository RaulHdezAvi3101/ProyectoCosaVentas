import type {
  ClaimAttemptResult,
  InboxChat,
  ListingStateSnapshot,
} from "@/types/marketplace";
import type { ClaimStore, TryClaimInput } from "./claim-store.interface";
import { getPaymentWindowMs } from "./constants";
import {
  buildSnapshotFromDb,
  ensureClaimUser,
  findClaimListing,
  getInboxFromDb,
  listingSupportsFtc,
  persistWin,
  phrasePreview,
  recordClaimAttempt,
  reservationToWinner,
  validatePhrase,
} from "./prisma-claim-store";
import { redisClaimRuntime } from "./redis-runtime";
import { schedulePaymentExpiredJob } from "@/server/jobs/schedule-payment-expired";

export class CompositeClaimStore implements ClaimStore {
  async joinRoom(listingId: string): Promise<ListingStateSnapshot | null> {
    if (!(await listingSupportsFtc(listingId))) return null;
    await redisClaimRuntime.joinViewers(listingId);
    return this.getState(listingId);
  }

  async leaveRoom(listingId: string): Promise<void> {
    await redisClaimRuntime.leaveViewers(listingId);
  }

  async getState(listingId: string): Promise<ListingStateSnapshot | null> {
    if (!(await listingSupportsFtc(listingId))) return null;

    let winner = await redisClaimRuntime.getWinner(listingId);
    const viewers = await redisClaimRuntime.getViewers(listingId);

    if (!winner) {
      const listing = await findClaimListing(listingId);
      const reservation = listing?.reservations[0];
      if (reservation) {
        winner = reservationToWinner(reservation);
      }
    }

    return buildSnapshotFromDb(listingId, viewers, winner);
  }

  async tryClaim(input: TryClaimInput): Promise<ClaimAttemptResult> {
    const { listingId, guestId, displayName, phrase } = input;
    const listing = await findClaimListing(listingId);

    if (!listing?.firstToClaim || !listing.claimPhraseHash) {
      return { outcome: "invalid" };
    }

    const preview = phrasePreview(phrase);
    const claimUser = await ensureClaimUser(
      guestId,
      displayName,
      input.userId
    );
    const paymentWindow = getPaymentWindowMs();

    const winner =
      (await redisClaimRuntime.getWinner(listingId)) ??
      (listing.reservations[0]
        ? reservationToWinner(listing.reservations[0])
        : null);

    const phraseOk = await validatePhrase(listing.claimPhraseHash, phrase);

    if (winner) {
      await recordClaimAttempt(
        listing.id,
        claimUser.userId,
        preview,
        false
      );

      if (
        winner.guestId === claimUser.guestId &&
        phraseOk
      ) {
        const deadline =
          listing.reservations[0]?.paymentDeadlineAt.getTime() ??
          winner.lockedAt + paymentWindow;
        return { outcome: "won", paymentDeadline: deadline };
      }
      return { outcome: "lost" };
    }

    if (!phraseOk) {
      return { outcome: "invalid" };
    }

    const lockedAt = Date.now();
    const winnerPayload = {
      userId: claimUser.userId,
      guestId: claimUser.guestId,
      displayName: claimUser.displayName,
      lockedAt,
    };

    const acquired = await redisClaimRuntime.trySetWinner(
      listingId,
      winnerPayload
    );

    if (!acquired) {
      await recordClaimAttempt(
        listing.id,
        claimUser.userId,
        preview,
        false
      );
      return { outcome: "lost" };
    }

    try {
      const { paymentDeadline, reservationId, listingSlug } = await persistWin(
        listing.id,
        listing.slug,
        claimUser.userId,
        preview,
        lockedAt
      );

      try {
        await schedulePaymentExpiredJob({ reservationId, listingSlug });
      } catch (jobErr) {
        console.error("[claim] schedule payment-expired job failed", jobErr);
      }

      return { outcome: "won", paymentDeadline };
    } catch (err) {
      console.error("[claim] persistWin failed, rolling back Redis lock", err);
      await redisClaimRuntime.clearWinner(listingId);
      return { outcome: "lost" };
    }
  }

  async getInboxForSeller(sellerId: string): Promise<InboxChat[]> {
    return getInboxFromDb(sellerId);
  }

  async listingSupportsRealtime(listingId: string): Promise<boolean> {
    return listingSupportsFtc(listingId);
  }
}
