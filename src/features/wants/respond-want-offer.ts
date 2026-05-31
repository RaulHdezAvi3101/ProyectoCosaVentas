import { prisma } from "@/server/db";
import { createNotification } from "@/features/notifications/notification-service";
import { toWantOfferDto, wantOfferSelect } from "@/features/wants/to-want-dto";
import type { WantOffer } from "@/types/wants";

export class RespondWantOfferError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "RespondWantOfferError";
    this.status = status;
  }
}

async function getOwnedPendingOffer(
  wantSlug: string,
  offerId: string,
  ownerId: string,
) {
  const want = await prisma.wantListItem.findUnique({
    where: { slug: wantSlug },
    select: {
      id: true,
      slug: true,
      title: true,
      userId: true,
      status: true,
    },
  });

  if (!want) {
    throw new RespondWantOfferError("Búsqueda no encontrada.", 404);
  }

  if (want.userId !== ownerId) {
    throw new RespondWantOfferError("No puedes gestionar estas ofertas.", 403);
  }

  if (want.status !== "active") {
    throw new RespondWantOfferError("Esta búsqueda ya no acepta respuestas.");
  }

  const offer = await prisma.wantOffer.findFirst({
    where: { id: offerId, wantId: want.id },
    select: {
      ...wantOfferSelect,
      sellerId: true,
      status: true,
    },
  });

  if (!offer) {
    throw new RespondWantOfferError("Oferta no encontrada.", 404);
  }

  if (offer.status !== "pending") {
    throw new RespondWantOfferError("Esta oferta ya fue respondida.");
  }

  return { want, offer };
}

export async function acceptWantOffer(
  wantSlug: string,
  offerId: string,
  ownerId: string,
): Promise<WantOffer> {
  const { want, offer } = await getOwnedPendingOffer(wantSlug, offerId, ownerId);

  const result = await prisma.$transaction(async (tx) => {
    const accepted = await tx.wantOffer.update({
      where: { id: offerId },
      data: { status: "accepted" },
      select: wantOfferSelect,
    });

    const rejectedOffers = await tx.wantOffer.findMany({
      where: {
        wantId: want.id,
        id: { not: offerId },
        status: "pending",
      },
      select: {
        id: true,
        sellerId: true,
        seller: { select: { displayName: true } },
      },
    });

    if (rejectedOffers.length > 0) {
      await tx.wantOffer.updateMany({
        where: {
          wantId: want.id,
          id: { not: offerId },
          status: "pending",
        },
        data: { status: "rejected" },
      });
    }

    await tx.wantListItem.update({
      where: { id: want.id },
      data: { status: "fulfilled" },
    });

    return { accepted, rejectedOffers };
  });

  await createNotification({
    userId: offer.sellerId,
    kind: "want_offer_accepted",
    title: "¡Aceptaron tu oferta!",
    body: `Tu oferta en «${want.title}» fue aceptada.`,
    href: `/wants/${want.slug}`,
  });

  for (const rejected of result.rejectedOffers) {
    await createNotification({
      userId: rejected.sellerId,
      kind: "want_offer_rejected",
      title: "Oferta no seleccionada",
      body: `Otra oferta fue aceptada en «${want.title}».`,
      href: `/wants/${want.slug}`,
    });
  }

  return toWantOfferDto(result.accepted);
}

export async function rejectWantOffer(
  wantSlug: string,
  offerId: string,
  ownerId: string,
): Promise<WantOffer> {
  const { want, offer } = await getOwnedPendingOffer(wantSlug, offerId, ownerId);

  const updated = await prisma.wantOffer.update({
    where: { id: offerId },
    data: { status: "rejected" },
    select: wantOfferSelect,
  });

  await createNotification({
    userId: offer.sellerId,
    kind: "want_offer_rejected",
    title: "Oferta rechazada",
    body: `Tu oferta en «${want.title}» fue rechazada.`,
    href: `/wants/${want.slug}`,
  });

  return toWantOfferDto(updated);
}
