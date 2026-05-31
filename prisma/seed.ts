import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import {
  SEED_BUNDLE_CATALOG,
  SEED_DEMO_USERS,
  SEED_LISTING_CATALOG,
} from "../src/lib/listings/seed-catalog";
import { SEED_CLAIM_PHRASES } from "./seed-phrases";
import { SEED_WANT_CATALOG } from "../src/lib/wants/seed-wants";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "demo1234";
const BCRYPT_ROUNDS = 10;

async function seedUsers(): Promise<Map<string, string>> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_ROUNDS);
  const sellerIdBySeedKey = new Map<string, string>();

  for (const user of SEED_DEMO_USERS) {
    const existing = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true },
    });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          displayName: user.displayName,
          handle: user.handle,
          avatarUrl: user.avatarUrl,
          sellerProfile: {
            upsert: {
              create: user.sellerProfile,
              update: user.sellerProfile,
            },
          },
        },
      });
      sellerIdBySeedKey.set(user.id, existing.id);
      continue;
    }

    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        passwordHash,
        displayName: user.displayName,
        handle: user.handle,
        avatarUrl: user.avatarUrl,
        sellerProfile: {
          create: user.sellerProfile,
        },
      },
    });
    sellerIdBySeedKey.set(user.id, user.id);
  }

  return sellerIdBySeedKey;
}

async function seedListings(sellerIdBySeedKey: Map<string, string>) {
  for (const entry of SEED_LISTING_CATALOG) {
    const sellerId = sellerIdBySeedKey.get(entry.sellerId) ?? entry.sellerId;
    let claimPhraseHash: string | null = null;

    if (entry.firstToClaim) {
      const phrase = SEED_CLAIM_PHRASES[entry.slug];
      if (phrase) {
        claimPhraseHash = await bcrypt.hash(phrase, BCRYPT_ROUNDS);
      }
    }

    await prisma.listing.upsert({
      where: { slug: entry.slug },
      update: {
        sellerId,
        title: entry.title,
        description: entry.description,
        priceCents: entry.priceCents,
        currency: entry.currency,
        category: entry.category,
        condition: entry.condition,
        imageUrls: entry.imageUrls,
        status: entry.status,
        firstToClaim: entry.firstToClaim,
        claimPhraseHash,
        phraseHidden: entry.phraseHidden,
        quantity: entry.quantity,
      },
      create: {
        slug: entry.slug,
        sellerId,
        title: entry.title,
        description: entry.description,
        priceCents: entry.priceCents,
        currency: entry.currency,
        category: entry.category,
        condition: entry.condition,
        imageUrls: entry.imageUrls,
        status: entry.status,
        firstToClaim: entry.firstToClaim,
        claimPhraseHash,
        phraseHidden: entry.phraseHidden,
        quantity: entry.quantity,
      },
    });
  }
}

async function seedBundles(sellerIdBySeedKey: Map<string, string>) {
  for (const entry of SEED_BUNDLE_CATALOG) {
    const sellerId = sellerIdBySeedKey.get(entry.sellerId) ?? entry.sellerId;

    const listings = await prisma.listing.findMany({
      where: { slug: { in: entry.listingSlugs } },
      select: { id: true, slug: true },
    });

    if (listings.length !== entry.listingSlugs.length) {
      console.warn(`Bundle seed omitido (${entry.slug}): faltan listings.`);
      continue;
    }

    const listingIdBySlug = new Map(listings.map((l) => [l.slug, l.id]));

    await prisma.bundle.upsert({
      where: { slug: entry.slug },
      update: {
        sellerId,
        title: entry.title,
        description: entry.description,
        priceCents: entry.priceCents,
        currency: entry.currency,
        pickCount: entry.pickCount,
        status: "active",
        items: {
          deleteMany: {},
          create: entry.listingSlugs.map((slug, index) => ({
            listingId: listingIdBySlug.get(slug)!,
            sortOrder: index,
          })),
        },
      },
      create: {
        slug: entry.slug,
        sellerId,
        title: entry.title,
        description: entry.description,
        priceCents: entry.priceCents,
        currency: entry.currency,
        pickCount: entry.pickCount,
        status: "active",
        items: {
          create: entry.listingSlugs.map((slug, index) => ({
            listingId: listingIdBySlug.get(slug)!,
            sortOrder: index,
          })),
        },
      },
    });
  }
}

async function seedWants(userIdBySeedKey: Map<string, string>) {
  for (const entry of SEED_WANT_CATALOG) {
    const userId = userIdBySeedKey.get(entry.userId) ?? entry.userId;

    await prisma.wantListItem.upsert({
      where: { slug: entry.slug },
      update: {
        userId,
        title: entry.title,
        description: entry.description,
        category: entry.category,
        desiredCondition: entry.desiredCondition,
        targetPriceCents: entry.targetPriceCents,
        currency: entry.currency,
        status: "active",
      },
      create: {
        slug: entry.slug,
        userId,
        title: entry.title,
        description: entry.description,
        category: entry.category,
        desiredCondition: entry.desiredCondition,
        targetPriceCents: entry.targetPriceCents,
        currency: entry.currency,
        status: "active",
      },
    });
  }

  const demoWant = await prisma.wantListItem.findUnique({
    where: { slug: "want-charizard-vmax" },
    select: { id: true },
  });
  const seller = await prisma.user.findUnique({
    where: { email: "maria@local.dev" },
    select: { id: true },
  });
  const listing = await prisma.listing.findUnique({
    where: { slug: "listing-pikachu-vmax" },
    select: { id: true },
  });

  if (demoWant && seller && listing) {
    await prisma.wantOffer.upsert({
      where: {
        wantId_sellerId: {
          wantId: demoWant.id,
          sellerId: seller.id,
        },
      },
      update: {
        listingId: listing.id,
        priceCents: 3_100_000,
        message:
          "Tengo un Pikachu VMAX rainbow CGC 10 disponible. Puedo negociar envío express.",
        status: "pending",
      },
      create: {
        wantId: demoWant.id,
        sellerId: seller.id,
        listingId: listing.id,
        priceCents: 3_100_000,
        message:
          "Tengo un Pikachu VMAX rainbow CGC 10 disponible. Puedo negociar envío express.",
        status: "pending",
      },
    });
  }
}

async function seedLockedDemo() {
  const listing = await prisma.listing.findUnique({
    where: { slug: "listing-locked" },
    select: { id: true },
  });

  const buyer = await prisma.user.findUnique({
    where: { email: "comprador@local.dev" },
    select: { id: true },
  });

  if (!listing || !buyer) {
    return;
  }

  const lockedAt = new Date(Date.now() - 5 * 60 * 1000);
  const paymentDeadlineAt = new Date(Date.now() + 25 * 60 * 1000);

  const reservation = await prisma.reservation.upsert({
    where: { listingId: listing.id },
    update: {
      userId: buyer.id,
      lockedAt,
      paymentDeadlineAt,
      releasedAt: null,
    },
    create: {
      listingId: listing.id,
      userId: buyer.id,
      lockedAt,
      paymentDeadlineAt,
    },
  });

  await prisma.order.upsert({
    where: { reservationId: reservation.id },
    update: { status: "pending", paidAt: null },
    create: {
      reservationId: reservation.id,
      status: "pending",
    },
  });

  const existingWinnerAttempt = await prisma.claimAttempt.findFirst({
    where: {
      listingId: listing.id,
      isWinner: true,
    },
    select: { id: true },
  });

  if (!existingWinnerAttempt) {
    await prisma.claimAttempt.create({
      data: {
        listingId: listing.id,
        userId: buyer.id,
        phrasePreview: "evol…",
        isWinner: true,
      },
    });
  }
}

async function main() {
  console.log("Seed: usuarios demo + catálogo + bundles + wants + reserva bloqueada…");
  const sellerIdBySeedKey = await seedUsers();
  await seedListings(sellerIdBySeedKey);
  await seedBundles(sellerIdBySeedKey);
  await seedWants(sellerIdBySeedKey);
  await seedLockedDemo();
  console.log(
    `Listo: ${SEED_DEMO_USERS.length} usuarios, ${SEED_LISTING_CATALOG.length} listings, ${SEED_BUNDLE_CATALOG.length} bundles, ${SEED_WANT_CATALOG.length} wants.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
