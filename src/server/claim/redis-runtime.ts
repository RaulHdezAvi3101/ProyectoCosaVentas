import { getRedis } from "@/server/redis";
import { getWinnerLockTtlSeconds, memoryStoreEnabled } from "@/server/claim/config";

export interface WinnerPayload {
  userId: string;
  displayName: string;
  lockedAt: number;
}

interface MemoryEntry {
  value: string;
  expiresAt: number | null;
}

const memoryWinners = new Map<string, MemoryEntry>();
const memoryViewers = new Map<string, number>();

function winnerKey(slug: string): string {
  return `listing:${slug}:winner`;
}

function viewersKey(slug: string): string {
  return `listing:${slug}:viewers`;
}

function parseWinnerPayload(raw: string): WinnerPayload | null {
  try {
    return JSON.parse(raw) as WinnerPayload;
  } catch {
    return null;
  }
}

function purgeExpiredMemoryWinner(key: string): void {
  const entry = memoryWinners.get(key);
  if (!entry?.expiresAt) {
    return;
  }

  if (entry.expiresAt <= Date.now()) {
    memoryWinners.delete(key);
  }
}

export async function getWinner(slug: string): Promise<WinnerPayload | null> {
  if (memoryStoreEnabled()) {
    const key = winnerKey(slug);
    purgeExpiredMemoryWinner(key);
    const raw = memoryWinners.get(key)?.value;
    if (!raw) {
      return null;
    }

    return parseWinnerPayload(raw);
  }

  const raw = await getRedis().get(winnerKey(slug));
  if (!raw) {
    return null;
  }

  return parseWinnerPayload(raw);
}

export async function setWinnerNx(
  slug: string,
  payload: WinnerPayload,
): Promise<boolean> {
  const serialized = JSON.stringify(payload);
  const ttlSeconds = getWinnerLockTtlSeconds();

  if (memoryStoreEnabled()) {
    const key = winnerKey(slug);
    purgeExpiredMemoryWinner(key);
    if (memoryWinners.has(key)) {
      return false;
    }

    memoryWinners.set(key, {
      value: serialized,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
    return true;
  }

  const result = await getRedis().set(
    winnerKey(slug),
    serialized,
    "EX",
    ttlSeconds,
    "NX",
  );

  return result === "OK";
}

export async function setWinner(
  slug: string,
  payload: WinnerPayload,
): Promise<void> {
  const serialized = JSON.stringify(payload);
  const ttlSeconds = getWinnerLockTtlSeconds();

  if (memoryStoreEnabled()) {
    memoryWinners.set(winnerKey(slug), {
      value: serialized,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
    return;
  }

  await getRedis().set(winnerKey(slug), serialized, "EX", ttlSeconds);
}

export async function clearWinner(slug: string): Promise<void> {
  if (memoryStoreEnabled()) {
    memoryWinners.delete(winnerKey(slug));
    return;
  }

  await getRedis().del(winnerKey(slug));
}

export async function incrementViewers(slug: string): Promise<number> {
  if (memoryStoreEnabled()) {
    const key = viewersKey(slug);
    const next = (memoryViewers.get(key) ?? 0) + 1;
    memoryViewers.set(key, next);
    return next;
  }

  return getRedis().incr(viewersKey(slug));
}

export async function decrementViewers(slug: string): Promise<number> {
  if (memoryStoreEnabled()) {
    const key = viewersKey(slug);
    const current = memoryViewers.get(key) ?? 0;
    const next = Math.max(0, current - 1);
    memoryViewers.set(key, next);
    return next;
  }

  const next = await getRedis().decr(viewersKey(slug));
  if (next < 0) {
    await getRedis().set(viewersKey(slug), "0");
    return 0;
  }

  return next;
}

export async function getViewers(slug: string): Promise<number> {
  if (memoryStoreEnabled()) {
    return memoryViewers.get(viewersKey(slug)) ?? 0;
  }

  const raw = await getRedis().get(viewersKey(slug));
  return raw ? Number(raw) : 0;
}
