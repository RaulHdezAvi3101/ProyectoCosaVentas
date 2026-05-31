const DEFAULT_PAYMENT_WINDOW_MS = 30 * 60 * 1000;

export function isGuestClaimAllowed(): boolean {
  return process.env.ALLOW_GUEST_CLAIM === "true";
}

export function getPaymentWindowMs(): number {
  const raw = process.env.PAYMENT_WINDOW_MS;
  if (!raw) {
    return DEFAULT_PAYMENT_WINDOW_MS;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_PAYMENT_WINDOW_MS;
  }

  return parsed;
}

export function getWinnerLockTtlSeconds(): number {
  return Math.ceil(getPaymentWindowMs() / 1000) + 60;
}

/** Evita prefijo `use*` — ESLint lo confunde con React Hooks. */
export function memoryStoreEnabled(): boolean {
  return process.env.USE_MEMORY_STORE === "true";
}
