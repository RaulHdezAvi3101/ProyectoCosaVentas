import { isDatabaseAvailable } from "@/lib/listings/queries";
import { isRedisAvailable } from "@/server/redis";
import type { ClaimStore } from "./claim-store.interface";
import { CompositeClaimStore } from "./composite-claim-store";
import { MemoryClaimStore } from "./memory-claim-store";
import { reconcileRedisFromPostgres } from "./reconcile";
import { reconcilePaymentExpiredJobs } from "@/server/jobs/reconcile-jobs";

let store: ClaimStore | null = null;
let initialized = false;

export async function initClaimStore(): Promise<void> {
  if (initialized) return;
  store = await resolveClaimStore();
  if (store instanceof CompositeClaimStore) {
    await reconcileRedisFromPostgres();
    if (await isRedisAvailable()) {
      await reconcilePaymentExpiredJobs();
    }
  }
  initialized = true;
}

async function resolveClaimStore(): Promise<ClaimStore> {
  if (process.env.USE_MEMORY_STORE === "1") {
    console.log("[claim] Using in-memory ClaimStore");
    return new MemoryClaimStore();
  }

  const [db, redisOk] = await Promise.all([
    isDatabaseAvailable(),
    isRedisAvailable(),
  ]);

  if (db && redisOk) {
    console.log("[claim] Using composite ClaimStore (PostgreSQL + Redis)");
    return new CompositeClaimStore();
  }

  console.log(
    `[claim] Fallback to in-memory ClaimStore (db=${db}, redis=${redisOk})`
  );
  return new MemoryClaimStore();
}

export async function getClaimStore(): Promise<ClaimStore> {
  if (!store) {
    await initClaimStore();
  }
  return store!;
}

/** Reinicia el singleton (tests / hot reload). */
export function resetClaimStore(): void {
  store = null;
  initialized = false;
}
