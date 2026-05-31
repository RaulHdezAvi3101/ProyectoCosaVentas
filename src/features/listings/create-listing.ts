import bcrypt from "bcrypt";
import { prisma } from "@/server/db";
import { toListingDto } from "@/features/listings/to-listing-dto";
import type { Listing } from "@/types/marketplace";
import {
  LISTING_CATEGORIES,
  LISTING_CONDITIONS,
  MAX_PHOTOS,
  MIN_PHOTOS,
} from "@/lib/camera/constants";

const BCRYPT_ROUNDS = 10;

export interface CreateListingInput {
  title: string;
  description: string;
  priceCents: number;
  category: string;
  condition: string;
  imageUrls: string[];
  firstToClaim?: boolean;
  claimPhrase?: string;
  phraseHidden?: boolean;
}

export class CreateListingError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "CreateListingError";
    this.status = status;
  }
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
  return base ? `${base}-${suffix}` : `listing-${suffix}`;
}

function validateInput(input: CreateListingInput): void {
  const title = input.title.trim();
  const description = input.description.trim();

  if (title.length < 3 || title.length > 120) {
    throw new CreateListingError("El título debe tener entre 3 y 120 caracteres.");
  }

  if (description.length < 10 || description.length > 4000) {
    throw new CreateListingError(
      "La descripción debe tener entre 10 y 4000 caracteres.",
    );
  }

  if (!Number.isInteger(input.priceCents) || input.priceCents < 100) {
    throw new CreateListingError("El precio mínimo es $1.00 MXN.");
  }

  if (!LISTING_CATEGORIES.includes(input.category as (typeof LISTING_CATEGORIES)[number])) {
    throw new CreateListingError("Selecciona una categoría válida.");
  }

  if (!LISTING_CONDITIONS.includes(input.condition as (typeof LISTING_CONDITIONS)[number])) {
    throw new CreateListingError("Selecciona una condición válida.");
  }

  if (
    input.imageUrls.length < MIN_PHOTOS ||
    input.imageUrls.length > MAX_PHOTOS
  ) {
    throw new CreateListingError(
      `Sube entre ${MIN_PHOTOS} y ${MAX_PHOTOS} fotos tomadas con la cámara.`,
    );
  }

  const firstToClaim = input.firstToClaim ?? false;

  if (firstToClaim) {
    const phrase = input.claimPhrase?.trim() ?? "";
    if (phrase.length < 4 || phrase.length > 64) {
      throw new CreateListingError(
        "La frase First-to-Claim debe tener entre 4 y 64 caracteres.",
      );
    }
  } else if (input.claimPhrase?.trim()) {
    throw new CreateListingError(
      "La frase clave solo aplica cuando First-to-Claim está activo.",
    );
  }
}

export async function createListing(
  sellerId: string,
  input: CreateListingInput,
): Promise<Listing> {
  validateInput(input);

  const firstToClaim = input.firstToClaim ?? false;
  let claimPhraseHash: string | null = null;

  if (firstToClaim && input.claimPhrase) {
    claimPhraseHash = await bcrypt.hash(input.claimPhrase.trim(), BCRYPT_ROUNDS);
  }

  const status = firstToClaim ? "live" : "active";

  const row = await prisma.listing.create({
    data: {
      slug: slugify(input.title.trim()),
      sellerId,
      title: input.title.trim(),
      description: input.description.trim(),
      priceCents: input.priceCents,
      category: input.category,
      condition: input.condition,
      imageUrls: input.imageUrls,
      status,
      firstToClaim,
      claimPhraseHash,
      phraseHidden: input.phraseHidden ?? true,
      quantity: 1,
    },
    select: {
      slug: true,
      title: true,
      description: true,
      priceCents: true,
      currency: true,
      category: true,
      condition: true,
      imageUrls: true,
      sellerId: true,
      status: true,
      firstToClaim: true,
      phraseHidden: true,
      quantity: true,
    },
  });

  return toListingDto(row);
}
