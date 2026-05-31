const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 12;

const attemptTimestamps = new Map<string, number[]>();

export function isClaimRateLimited(userId: string, listingSlug: string): boolean {
  const key = `${userId}:${listingSlug}`;
  const now = Date.now();
  const recent = (attemptTimestamps.get(key) ?? []).filter(
    (timestamp) => now - timestamp < WINDOW_MS,
  );

  if (recent.length >= MAX_ATTEMPTS) {
    attemptTimestamps.set(key, recent);
    return true;
  }

  recent.push(now);
  attemptTimestamps.set(key, recent);
  return false;
}
