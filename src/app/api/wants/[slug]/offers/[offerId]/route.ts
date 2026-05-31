import type { NextRequest } from "next/server";
import {
  acceptWantOffer,
  rejectWantOffer,
  RespondWantOfferError,
} from "@/features/wants/respond-want-offer";
import {
  apiError,
  apiJson,
  handleApiError,
  parseApiJsonBody,
  requireApiSession,
} from "@/lib/api/route-helpers";

interface RouteParams {
  params: { slug: string; offerId: string };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await requireApiSession(
    "Inicia sesión para responder ofertas.",
  );
  if (!auth.ok) {
    return auth.response;
  }

  const body = await parseApiJsonBody(request);
  if (!body.ok) {
    return body.response;
  }

  const action = String(body.payload.action ?? "");

  try {
    const offer =
      action === "accept"
        ? await acceptWantOffer(params.slug, params.offerId, auth.session.user.id)
        : action === "reject"
          ? await rejectWantOffer(params.slug, params.offerId, auth.session.user.id)
          : null;

    if (!offer) {
      return apiError("Acción inválida.", 400);
    }

    return apiJson({ offer: { id: offer.id, status: offer.status } });
  } catch (error) {
    return handleApiError(error, {
      logTag: "[want offer PATCH]",
      fallbackMessage: "No se pudo responder la oferta.",
      DomainError: RespondWantOfferError,
    });
  }
}
