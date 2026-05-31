import type { NextRequest } from "next/server";
import {
  createWantOffer,
  CreateWantOfferError,
} from "@/features/wants/create-want-offer";
import {
  apiJson,
  handleApiError,
  parseApiJsonBody,
  requireApiSession,
} from "@/lib/api/route-helpers";

interface RouteParams {
  params: { slug: string };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const auth = await requireApiSession("Inicia sesión para hacer una oferta.");
  if (!auth.ok) {
    return auth.response;
  }

  const body = await parseApiJsonBody(request);
  if (!body.ok) {
    return body.response;
  }

  const payload = body.payload;

  try {
    const offer = await createWantOffer(params.slug, auth.session.user.id, {
      priceCents: Number(payload.priceCents),
      message: String(payload.message ?? ""),
      listingSlug:
        typeof payload.listingSlug === "string" ? payload.listingSlug : undefined,
    });

    return apiJson({ offer: { id: offer.id } }, 201);
  } catch (error) {
    return handleApiError(error, {
      logTag: "[wants offers POST]",
      fallbackMessage: "No se pudo enviar la oferta.",
      DomainError: CreateWantOfferError,
    });
  }
}
