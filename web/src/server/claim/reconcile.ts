import { findLockedListingsForReconcile, reservationToWinner } from "./prisma-claim-store";
import { redisClaimRuntime } from "./redis-runtime";

/** Sincroniza claves Redis de ganador desde reservas activas en PG (tras reinicio). */
export async function reconcileRedisFromPostgres(): Promise<void> {
  const locked = await findLockedListingsForReconcile();

  for (const listing of locked) {
    const reservation = listing.reservations[0];
    if (!reservation) continue;

    const existing = await redisClaimRuntime.getWinner(listing.slug);
    if (existing) continue;

    const winner = reservationToWinner(reservation);
    await redisClaimRuntime.setWinner(listing.slug, winner);
    console.log(`[claim] Redis reconciled winner for ${listing.slug}`);
  }
}
