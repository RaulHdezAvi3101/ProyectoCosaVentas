import { prisma } from "@/server/db";
import { createNotification } from "@/features/notifications/notification-service";
import { toWantOfferDto, wantOfferSelect } from "@/features/wants/to-want-dto";
import type { WantOffer } from "@/types/wants";

export interface CreateWantOfferInput {
  priceCents: number;
  message: string;
  listingSlug?: string;
}

export class CreateWantOfferError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "CreateWantOfferError";
    this.status = status;
  }
}

function validateInput(input: CreateWantOfferInput): void {
  const message = input.message.trim();

  if (!Number.isInteger(input.priceCents) || input.priceCents < 100) {
    throw new CreateWantOfferError("El precio ofertado mínimo es $1.00 MXN.");
  }

  if (message.length < 10 || message.length > 2000) {
    throw new CreateWantOfferError(
      "El mensaje debe tener entre 10 y 2000 caracteres.",
    );
  }
}

export async function createWantOffer(
  wantSlug: string,
  sellerId: string,
  input: CreateWantOfferInput,
): Promise<WantOffer> {
  validateInput(input);

  const want = await prisma.wantListItem.findUnique({
    where: { slug: wantSlug },
    select: { id: true, slug: true, title: true, userId: true, status: true },
  });

  if (!want || want.status !== "active") {
    throw new CreateWantOfferError("Esta búsqueda no está disponible.", 404);
  }

  if (want.userId === sellerId) {
    throw new CreateWantOfferError("No puedes ofertar en tu propia búsqueda.");
  }

  let listingId: string | undefined;

  if (input.listingSlug?.trim()) {
    const listing = await prisma.listing.findFirst({
      where: {
        slug: input.listingSlug.trim(),
        sellerId,
        status: { in: ["active", "live"] },
      },
      select: { id: true },
    });

    if (!listing) {
      throw new CreateWantOfferError(
        "La publicación vinculada no es válida o no te pertenece.",
      );
    }

    listingId = listing.id;
  }

  const existing = await prisma.wantOffer.findUnique({
    where: {
      wantId_sellerId: { wantId: want.id, sellerId },
    },
    select: { id: true },
  });

  const row = await prisma.wantOffer.upsert({
    where: {
      wantId_sellerId: {
        wantId: want.id,
        sellerId,
      },
    },
    create: {
      wantId: want.id,
      sellerId,
      listingId,
      priceCents: input.priceCents,
      message: input.message.trim(),
      status: "pending",
    },
    update: {
      listingId,
      priceCents: input.priceCents,
      message: input.message.trim(),
      status: "pending",
    },
    select: wantOfferSelect,
  });

  if (!existing) {
    await createNotification({
      userId: want.userId,
      kind: "want_offer_received",
      title: "Nueva oferta en tu búsqueda",
      body: `Recibiste una oferta en «${want.title}».`,
      href: `/wants/${want.slug}`,
    });
  }

  return toWantOfferDto(row);
}

export async function listSellerListingsForOffer(
  sellerId: string,
): Promise<Array<{ id: string; title: string; price: number }>> {
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
    },
  });

  return rows.map((row) => ({
    id: row.slug,
    title: row.title,
    price: row.priceCents,
  }));
}
