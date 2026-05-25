import { listings } from "@/mock/data";
import { SEED_CLAIM_PHRASES } from "../../../prisma/seed-phrases";
import type {
  ClaimAttemptResult,
  InboxChat,
  ListingStateSnapshot,
  RuntimeListingStatus,
} from "@/types/marketplace";
import type { ClaimStore, TryClaimInput } from "./claim-store.interface";
import { getPaymentWindowMs } from "./constants";
import { normalizePhrase, phrasePreview } from "./utils";

interface ListingRuntime {
  status: RuntimeListingStatus;
  viewers: number;
  winner?: {
    guestId: string;
    displayName: string;
    lockedAt: number;
  };
}

interface ClaimAttemptRecord {
  id: string;
  guestId: string;
  displayName: string;
  listingId: string;
  preview: string;
  status: "winner" | "late";
  at: number;
}

export class MemoryClaimStore implements ClaimStore {
  private readonly runtime = new Map<string, ListingRuntime>();
  private readonly phrases = new Map<string, string>();
  private readonly attempts: ClaimAttemptRecord[] = [];

  constructor() {
    this.seedRuntime();
  }

  private seedRuntime() {
    for (const listing of listings) {
      if (!listing.firstToClaim) continue;

      const phrase =
        listing.phrase ?? SEED_CLAIM_PHRASES[listing.id] ?? undefined;
      if (!phrase) continue;

      this.phrases.set(listing.id, phrase);

      const status: RuntimeListingStatus =
        listing.status === "locked" ? "locked" : "live";

      this.runtime.set(listing.id, {
        status,
        viewers: listing.viewers ?? 0,
        ...(listing.status === "locked"
          ? {
              winner: {
                guestId: "seed-winner",
                displayName: "Comprador demo",
                lockedAt: Date.now() - 2 * 60 * 1000,
              },
            }
          : {}),
      });
    }
  }

  private getOrCreateRuntime(listingId: string): ListingRuntime | undefined {
    if (!this.phrases.has(listingId)) return undefined;
    let state = this.runtime.get(listingId);
    if (!state) {
      state = { status: "live", viewers: 0 };
      this.runtime.set(listingId, state);
    }
    return state;
  }

  private toSnapshot(listingId: string): ListingStateSnapshot | null {
    const state = this.runtime.get(listingId);
    if (!state) return null;

    const paymentWindow = getPaymentWindowMs();
    const paymentDeadline = state.winner
      ? state.winner.lockedAt + paymentWindow
      : undefined;

    return {
      listingId,
      status: state.status,
      viewers: state.viewers,
      winner: state.winner
        ? {
            guestId: state.winner.guestId,
            displayName: state.winner.displayName,
            lockedAt: state.winner.lockedAt,
          }
        : undefined,
      paymentDeadline,
    };
  }

  async joinRoom(listingId: string): Promise<ListingStateSnapshot | null> {
    const state = this.getOrCreateRuntime(listingId);
    if (!state) return null;
    state.viewers += 1;
    return this.toSnapshot(listingId);
  }

  async leaveRoom(listingId: string): Promise<void> {
    const state = this.runtime.get(listingId);
    if (!state || state.viewers <= 0) return;
    state.viewers -= 1;
  }

  async getState(listingId: string): Promise<ListingStateSnapshot | null> {
    return this.toSnapshot(listingId);
  }

  async tryClaim(input: TryClaimInput): Promise<ClaimAttemptResult> {
    const { listingId, guestId, displayName, phrase } = input;
    const expected = this.phrases.get(listingId);
    const state = this.getOrCreateRuntime(listingId);
    if (!expected || !state) {
      return { outcome: "invalid" };
    }

    const normalized = normalizePhrase(phrase);
    const preview = phrasePreview(phrase);
    const paymentWindow = getPaymentWindowMs();

    if (state.status === "locked" && state.winner) {
      this.recordAttempt(listingId, guestId, displayName, preview, "late");
      if (
        state.winner.guestId === guestId &&
        normalized === normalizePhrase(expected)
      ) {
        return {
          outcome: "won",
          paymentDeadline: state.winner.lockedAt + paymentWindow,
        };
      }
      return { outcome: "lost" };
    }

    if (normalized !== normalizePhrase(expected)) {
      return { outcome: "invalid" };
    }

    if (state.winner) {
      this.recordAttempt(listingId, guestId, displayName, preview, "late");
      return { outcome: "lost" };
    }

    const lockedAt = Date.now();
    state.winner = { guestId, displayName, lockedAt };
    state.status = "locked";
    this.recordAttempt(listingId, guestId, displayName, preview, "winner");

    return {
      outcome: "won",
      paymentDeadline: lockedAt + paymentWindow,
    };
  }

  private recordAttempt(
    listingId: string,
    guestId: string,
    displayName: string,
    preview: string,
    status: "winner" | "late"
  ) {
    const existing = this.attempts.find(
      (a) => a.listingId === listingId && a.guestId === guestId
    );
    if (existing) {
      existing.status = status;
      existing.preview = preview;
      existing.at = Date.now();
      return;
    }
    this.attempts.push({
      id: `${listingId}-${guestId}-${Date.now()}`,
      guestId,
      displayName,
      listingId,
      preview,
      status,
      at: Date.now(),
    });
  }

  async getInboxForSeller(sellerId: string): Promise<InboxChat[]> {
    const sellerListings = listings
      .filter((l) => l.sellerId === sellerId && l.firstToClaim)
      .map((l) => l.id);

    const relevant = this.attempts
      .filter((a) => sellerListings.includes(a.listingId))
      .sort((a, b) => {
        if (a.status === "winner" && b.status !== "winner") return -1;
        if (b.status === "winner" && a.status !== "winner") return 1;
        return b.at - a.at;
      });

    return relevant.map((a) => {
      const snap = this.toSnapshot(a.listingId);
      return {
        id: a.id,
        guestId: a.guestId,
        name: a.displayName,
        preview: a.preview,
        listingId: a.listingId,
        status: a.status,
        paymentDeadline: snap?.paymentDeadline,
      };
    });
  }

  async listingSupportsRealtime(listingId: string): Promise<boolean> {
    return this.phrases.has(listingId);
  }
}
