import { PrismaClient, ListingStatus, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SEED_LISTING_DEFS } from "../src/lib/listings/seed-catalog";
import { SEED_CLAIM_PHRASES } from "./seed-phrases";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "demo1234";

async function hashPhrase(phrase: string): Promise<string> {
  return bcrypt.hash(phrase.trim().toLowerCase(), 10);
}

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const maria = await prisma.user.upsert({
    where: { id: "seller-1" },
    update: {},
    create: {
      id: "seller-1",
      email: "maria@local.dev",
      passwordHash,
      displayName: "María Colecciones",
      handle: "@maria_colecciones",
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      role: UserRole.seller,
      sellerProfile: {
        create: {
          score: 942,
          tier: "elite",
          sales: 1247,
          positiveRate: 99.2,
          onTimeShipping: 97,
          memberSince: "2022",
        },
      },
    },
  });

  const luis = await prisma.user.upsert({
    where: { id: "seller-2" },
    update: {},
    create: {
      id: "seller-2",
      email: "luis@local.dev",
      passwordHash,
      displayName: "Luis TCG",
      handle: "@luis_tcg",
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      role: UserRole.seller,
      sellerProfile: {
        create: {
          score: 680,
          tier: "trusted",
          sales: 312,
          positiveRate: 96.5,
          onTimeShipping: 91,
          memberSince: "2023",
        },
      },
    },
  });

  const nuevoProfile = {
    score: 0,
    tier: "nuevo",
    sales: 0,
    positiveRate: 0,
    onTimeShipping: 0,
    memberSince: "2026",
  };

  const lowProfile = {
    score: 142,
    tier: "low",
    sales: 28,
    positiveRate: 68.4,
    onTimeShipping: 61,
    memberSince: "2024",
  };

  const sofia = await prisma.user.upsert({
    where: { id: "seller-3" },
    update: {
      displayName: "Sofía Primeras Ventas",
      handle: "@sofia_primeras",
      role: UserRole.seller,
      sellerProfile: { update: nuevoProfile },
    },
    create: {
      id: "seller-3",
      email: "sofia@local.dev",
      passwordHash,
      displayName: "Sofía Primeras Ventas",
      handle: "@sofia_primeras",
      avatarUrl:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
      role: UserRole.seller,
      sellerProfile: { create: nuevoProfile },
    },
  });

  const raul = await prisma.user.upsert({
    where: { id: "seller-4" },
    update: {
      displayName: "Raúl Outlet Riesgoso",
      handle: "@raul_outlet",
      role: UserRole.seller,
      sellerProfile: { update: lowProfile },
    },
    create: {
      id: "seller-4",
      email: "raul@local.dev",
      passwordHash,
      displayName: "Raúl Outlet Riesgoso",
      handle: "@raul_outlet",
      avatarUrl:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
      role: UserRole.seller,
      sellerProfile: { create: lowProfile },
    },
  });

  for (const [userId, data] of [
    [sofia.id, nuevoProfile],
    [raul.id, lowProfile],
  ] as const) {
    await prisma.sellerProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  const sellerIdByDef: Record<string, string> = {
    "seller-1": maria.id,
    "seller-2": luis.id,
    "seller-3": sofia.id,
    "seller-4": raul.id,
  };

  await prisma.user.upsert({
    where: { email: "comprador@local.dev" },
    update: {},
    create: {
      email: "comprador@local.dev",
      passwordHash,
      displayName: "Comprador demo",
      handle: "@comprador_demo",
      role: UserRole.buyer,
    },
  });

  for (const def of SEED_LISTING_DEFS) {
    const phrase =
      def.phraseKey != null ? SEED_CLAIM_PHRASES[def.phraseKey] ?? null : null;
    const claimPhraseHash = phrase != null ? await hashPhrase(phrase) : null;
    const status = def.status as ListingStatus;

    const listing = await prisma.listing.upsert({
      where: { slug: def.slug },
      update: {
        title: def.title,
        description: def.description,
        priceCents: def.priceCents,
        category: def.category,
        condition: def.condition,
        imageUrls: [...def.imageUrls],
        status,
        claimPhraseHash,
        phraseHidden: def.phraseHidden,
        firstToClaim: def.firstToClaim,
      },
      create: {
        slug: def.slug,
        sellerId: sellerIdByDef[def.sellerId],
        title: def.title,
        description: def.description,
        priceCents: def.priceCents,
        category: def.category,
        condition: def.condition,
        imageUrls: [...def.imageUrls],
        status,
        firstToClaim: def.firstToClaim,
        claimPhraseHash,
        phraseHidden: def.phraseHidden,
      },
    });

    if (def.slug === "listing-locked") {
      const buyer = await prisma.user.findUnique({
        where: { email: "comprador@local.dev" },
      });
      if (!buyer) throw new Error("comprador@local.dev no encontrado");

      const paymentDeadlineAt = new Date(Date.now() + 30 * 60 * 1000);

      await prisma.reservation.upsert({
        where: { listingId: listing.id },
        update: {
          paymentDeadlineAt,
          releasedAt: null,
        },
        create: {
          listingId: listing.id,
          winnerId: buyer.id,
          lockedAt: new Date(Date.now() - 2 * 60 * 1000),
          paymentDeadlineAt,
        },
      });
    }
  }

  console.log("Seed OK:", {
    sellers: [maria.email, luis.email, sofia.email, raul.email],
    profiles: {
      nuevo: "/profile/seller-3 (sofia@local.dev)",
      bajo: "/profile/seller-4 (raul@local.dev)",
    },
    listings: SEED_LISTING_DEFS.map((l) => l.slug),
    login: "maria@local.dev / sofia@local.dev / raul@local.dev / comprador@local.dev → demo1234",
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
