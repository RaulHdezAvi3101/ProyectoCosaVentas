import { redis } from "@/server/redis";
import { getLockTtlSeconds } from "./constants";

export interface WinnerCache {
  userId: string;
  guestId: string;
  displayName: string;
  lockedAt: number;
}

function winnerKey(slug: string) {
  return `listing:${slug}:winner`;
}

function viewersKey(slug: string) {
  return `listing:${slug}:viewers`;
}

export class RedisClaimRuntime {
  async joinViewers(slug: string): Promise<number> {
    const count = await redis.incr(viewersKey(slug));
    return count;
  }

  async leaveViewers(slug: string): Promise<number> {
    const key = viewersKey(slug);
    const count = await redis.decr(key);
    if (count < 0) {
      await redis.set(key, "0");
      return 0;
    }
    return count;
  }

  async getViewers(slug: string): Promise<number> {
    const raw = await redis.get(viewersKey(slug));
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isNaN(n) || n < 0 ? 0 : n;
  }

  async getWinner(slug: string): Promise<WinnerCache | null> {
    const raw = await redis.get(winnerKey(slug));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as WinnerCache;
    } catch {
      return null;
    }
  }

  /** SET NX EX — true si este cliente ganó el lock */
  async trySetWinner(slug: string, winner: WinnerCache): Promise<boolean> {
    const ttl = getLockTtlSeconds();
    const result = await redis.set(
      winnerKey(slug),
      JSON.stringify(winner),
      "EX",
      ttl,
      "NX"
    );
    return result === "OK";
  }

  async setWinner(slug: string, winner: WinnerCache): Promise<void> {
    const ttl = getLockTtlSeconds();
    await redis.set(winnerKey(slug), JSON.stringify(winner), "EX", ttl);
  }

  async clearWinner(slug: string): Promise<void> {
    await redis.del(winnerKey(slug));
  }
}

export const redisClaimRuntime = new RedisClaimRuntime();
