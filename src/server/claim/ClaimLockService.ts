import { setWinnerNx, type WinnerPayload } from "@/server/claim/redis-runtime";

export class ClaimLockService {
  async tryAcquireWinnerLock(
    listingSlug: string,
    payload: WinnerPayload,
  ): Promise<boolean> {
    return setWinnerNx(listingSlug, payload);
  }
}

export const claimLockService = new ClaimLockService();
