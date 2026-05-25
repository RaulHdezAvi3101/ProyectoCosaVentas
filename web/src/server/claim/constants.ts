export function getPaymentWindowMs(): number {
  const raw = process.env.PAYMENT_WINDOW_MS;
  const parsed = raw ? parseInt(raw, 10) : NaN;
  if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  return 30 * 60 * 1000;
}

export function getLockTtlSeconds(): number {
  return Math.ceil(getPaymentWindowMs() / 1000);
}
