import { ListingStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SEED_IMAGES } from "@/lib/listings/seed-catalog";
import { prisma } from "@/server/db";
import { normalizePhrase } from "@/server/claim/utils";

export interface CreateListingInput {
  title: string;
  description: string;
  price: number;
  currency?: string;
  category: string;
  condition: string;
  imageUrls?: string[];
  firstToClaim?: boolean;
  phrase?: string;
  phraseHidden?: boolean;
  status?: "draft" | "active" | "live";
}

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  const suffix = Date.now().toString(36).slice(-5);
  return `${base || "listing"}-${suffix}`;
}

const PLACEHOLDER_IMAGES = [SEED_IMAGES.cardsA];

export async function createListingForSeller(
  sellerId: string,
  input: CreateListingInput
) {
  const firstToClaim = Boolean(input.firstToClaim);
  let claimPhraseHash: string | null = null;

  if (firstToClaim) {
    const phrase = input.phrase?.trim();
    if (!phrase) {
      throw new Error("Frase clave requerida para First to Claim");
    }
    claimPhraseHash = await bcrypt.hash(normalizePhrase(phrase), 10);
  }

  const statusMap: Record<string, ListingStatus> = {
    draft: ListingStatus.draft,
    active: ListingStatus.active,
    live: ListingStatus.live,
  };
  const status =
    statusMap[input.status ?? "live"] ?? ListingStatus.live;

  const slug = slugify(input.title);
  const priceCents = Math.round(input.price * 100);
  if (priceCents <= 0 || priceCents > 99_999_999) {
    throw new Error("Precio fuera de rango permitido");
  }

  return prisma.listing.create({
    data: {
      slug,
      sellerId,
      title: input.title.trim(),
      description: input.description.trim(),
      priceCents,
      currency: input.currency ?? "MXN",
      category: input.category.trim(),
      condition: input.condition.trim(),
      imageUrls:
        input.imageUrls?.length ? input.imageUrls : PLACEHOLDER_IMAGES,
      status,
      firstToClaim,
      claimPhraseHash,
      phraseHidden: input.phraseHidden ?? false,
    },
  });
}
