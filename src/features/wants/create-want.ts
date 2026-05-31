import { prisma } from "@/server/db";
import { toWantDto, wantFeedSelect } from "@/features/wants/to-want-dto";
import {
  LISTING_CATEGORIES,
  LISTING_CONDITIONS,
} from "@/lib/camera/constants";
import type { WantListItem } from "@/types/wants";

export interface CreateWantInput {
  title: string;
  description: string;
  category: string;
  desiredCondition: string;
  targetPriceCents: number;
}

export class CreateWantError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "CreateWantError";
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
  return base ? `want-${base}-${suffix}` : `want-${suffix}`;
}

function validateInput(input: CreateWantInput): void {
  const title = input.title.trim();
  const description = input.description.trim();

  if (title.length < 3 || title.length > 120) {
    throw new CreateWantError("El título debe tener entre 3 y 120 caracteres.");
  }

  if (description.length < 10 || description.length > 4000) {
    throw new CreateWantError(
      "La descripción debe tener entre 10 y 4000 caracteres.",
    );
  }

  if (!Number.isInteger(input.targetPriceCents) || input.targetPriceCents < 100) {
    throw new CreateWantError("El precio objetivo mínimo es $1.00 MXN.");
  }

  if (!LISTING_CATEGORIES.includes(input.category as (typeof LISTING_CATEGORIES)[number])) {
    throw new CreateWantError("Selecciona una categoría válida.");
  }

  if (
    !LISTING_CONDITIONS.includes(
      input.desiredCondition as (typeof LISTING_CONDITIONS)[number],
    )
  ) {
    throw new CreateWantError("Selecciona un estado deseado válido.");
  }
}

export async function createWant(
  userId: string,
  input: CreateWantInput,
): Promise<WantListItem> {
  validateInput(input);

  const row = await prisma.wantListItem.create({
    data: {
      slug: slugify(input.title.trim()),
      userId,
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      desiredCondition: input.desiredCondition,
      targetPriceCents: input.targetPriceCents,
      status: "active",
    },
    select: wantFeedSelect,
  });

  return toWantDto(row);
}
