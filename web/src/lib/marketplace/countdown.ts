export function formatCountdown(deadlineMs: number, now = Date.now()): string {
  const remaining = Math.max(0, deadlineMs - now);
  const mins = Math.floor(remaining / 60_000);
  const secs = Math.floor((remaining % 60_000) / 1000);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
