/**
 * Verificación rápida Entrega 2: composite store + Redis NX + PG.
 * Uso: npx tsx scripts/verify-claim-store.ts
 */
import { resetClaimStore, initClaimStore, getClaimStore } from "../src/server/claim";
import { prisma } from "../src/server/db";
import { redis } from "../src/server/redis";

async function main() {
  resetClaimStore();
  await initClaimStore();
  const store = await getClaimStore();

  const slug = "live-charizard";
  const supports = await store.listingSupportsRealtime(slug);
  if (!supports) {
    throw new Error("listingSupportsRealtime failed");
  }

  await store.joinRoom(slug);
  const before = await store.getState(slug);
  if (!before || before.status !== "live") {
    throw new Error(`Expected live state, got ${JSON.stringify(before)}`);
  }

  const guestA = "guest-verify-a";
  const guestB = "guest-verify-b";

  const winA = await store.tryClaim({
    listingId: slug,
    guestId: guestA,
    displayName: "Guest A",
    phrase: "charizard mx",
  });

  if (winA.outcome !== "won") {
    throw new Error(`Guest A should win, got ${winA.outcome}`);
  }

  const winB = await store.tryClaim({
    listingId: slug,
    guestId: guestB,
    displayName: "Guest B",
    phrase: "charizard mx",
  });

  if (winB.outcome !== "lost") {
    throw new Error(`Guest B should lose, got ${winB.outcome}`);
  }

  const listing = await prisma.listing.findUnique({
    where: { slug },
    include: { reservations: true },
  });

  if (listing?.status !== "locked" || !listing.reservations.length) {
    throw new Error("Listing not locked in PG");
  }

  const redisWinner = await redis.get(`listing:${slug}:winner`);
  if (!redisWinner) {
    throw new Error("Redis winner key missing");
  }

  // Reset listing for repeated runs (dev only)
  await prisma.$transaction([
    prisma.claimAttempt.deleteMany({ where: { listing: { slug } } }),
    prisma.reservation.deleteMany({ where: { listing: { slug } } }),
    prisma.listing.update({
      where: { slug },
      data: { status: "live" },
    }),
  ]);
  await redis.del(`listing:${slug}:winner`);

  console.log("✓ Entrega 2 verify-claim-store OK");
  await prisma.$disconnect();
  redis.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
