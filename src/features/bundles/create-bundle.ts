import { prisma } from "@/server/db";
import { toBundleDto, bundleSelect } from "@/features/bundles/to-bundle-dto";
import type { Bundle } from "@/types/marketplace";

export interface CreateBundleInput {
  title: string;
  description: string;
  priceCents: number;
  listingIds: string[];
  pickCount?: number | null;
}

export class CreateBundleError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "CreateBundleError";
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
  return base ? `bundle-${base}-${suffix}` : `bundle-${suffix}`;
}

function validateInput(input: CreateBundleInput): void {
  const title = input.title.trim();
  const description = input.description.trim();

  if (title.length < 3 || title.length > 120) {
    throw new CreateBundleError("El título debe tener entre 3 y 120 caracteres.");
  }

  if (description.length < 10 || description.length > 4000) {
    throw new CreateBundleError(
      "La descripción debe tener entre 10 y 4000 caracteres.",
    );
  }

  if (!Number.isInteger(input.priceCents) || input.priceCents < 100) {
    throw new CreateBundleError("El precio mínimo es $1.00 MXN.");
  }

  if (input.listingIds.length < 2) {
    throw new CreateBundleError("Un bundle requiere al menos 2 artículos.");
  }

  if (input.listingIds.length > 20) {
    throw new CreateBundleError("Un bundle admite máximo 20 artículos.");
  }

  const pickCount = input.pickCount ?? null;

  if (pickCount !== null) {
    if (!Number.isInteger(pickCount) || pickCount < 1) {
      throw new CreateBundleError("pickCount debe ser un entero positivo.");
    }

    if (pickCount >= input.listingIds.length) {
      throw new CreateBundleError(
        "pickCount debe ser menor que el total de artículos del lote.",
      );
    }
  }
}

export async function createBundle(
  sellerId: string,
  input: CreateBundleInput,
): Promise<Bundle> {
  validateInput(input);

  const uniqueSlugs = [...new Set(input.listingIds)];

  if (uniqueSlugs.length !== input.listingIds.length) {
    throw new CreateBundleError("No repitas artículos en el bundle.");
  }

  const listings = await prisma.listing.findMany({
    where: {
      slug: { in: uniqueSlugs },
      sellerId,
      status: { in: ["active", "live"] },
    },
    select: { id: true, slug: true, priceCents: true },
  });

  if (listings.length !== uniqueSlugs.length) {
    throw new CreateBundleError(
      "Solo puedes incluir tus publicaciones activas.",
    );
  }

  const slugByInternalId = new Map(listings.map((l) => [l.slug, l.id]));
  const orderedInternalIds = uniqueSlugs.map(
    (slug) => slugByInternalId.get(slug)!,
  );

  const individualTotal = listings.reduce((sum, l) => sum + l.priceCents, 0);

  if (input.priceCents >= individualTotal) {
    throw new CreateBundleError(
      "El precio del bundle debe ser menor que la suma individual.",
    );
  }

  const row = await prisma.bundle.create({
    data: {
      slug: slugify(input.title.trim()),
      sellerId,
      title: input.title.trim(),
      description: input.description.trim(),
      priceCents: input.priceCents,
      pickCount: input.pickCount ?? null,
      status: "active",
      items: {
        create: orderedInternalIds.map((listingId, index) => ({
          listingId,
          sortOrder: index,
        })),
      },
    },
    select: bundleSelect,
  });

  return toBundleDto(row);
}

export async function listSellerListingsForBundle(
  sellerId: string,
): Promise<
  Array<{
    id: string;
    title: string;
    price: number;
    category: string;
    imageUrls: string[];
  }>
> {
  const rows = await prisma.listing.findMany({
    where: {
      sellerId,
      status: { in: ["active", "live"] },
    },
    orderBy: { createdAt: "desc" },
    select: {
      slug: true,
      title: true,
      priceCents: true,
      category: true,
      imageUrls: true,
    },
  });

  return rows.map((row) => ({
    id: row.slug,
    title: row.title,
    price: row.priceCents,
    category: row.category,
    imageUrls: row.imageUrls,
  }));
}
