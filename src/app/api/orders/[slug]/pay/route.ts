import type { NextRequest } from "next/server";
import { PaymentError } from "@/server/payment/errors";
import { payOrder } from "@/server/payment/pay-order";
import {
  apiJson,
  handleApiError,
  requireApiSession,
  tryParseApiJsonBody,
} from "@/lib/api/route-helpers";

interface RouteContext {
  params: { slug: string };
}

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await requireApiSession("Inicia sesión para pagar.");
  if (!auth.ok) {
    return auth.response;
  }

  const body = await tryParseApiJsonBody(request);
  if (!body.ok) {
    return body.response;
  }

  const idempotencyKey =
    body.payload && "idempotency_key" in body.payload
      ? String(body.payload.idempotency_key ?? "")
      : undefined;

  try {
    const result = await payOrder({
      listingSlug: context.params.slug,
      userId: auth.session.user.id,
      idempotencyKey: idempotencyKey || undefined,
    });

    return apiJson({
      listingSlug: result.listingSlug,
      paidAt: result.paidAt,
      alreadyPaid: result.alreadyPaid,
    });
  } catch (error) {
    return handleApiError(error, {
      logTag: "[orders pay POST]",
      fallbackMessage: "No se pudo procesar el pago. Intenta de nuevo.",
      DomainError: PaymentError,
    });
  }
}
