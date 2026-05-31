import { getCheckoutState } from "@/server/payment/get-checkout-state";
import { apiError, apiJson, requireApiSession } from "@/lib/api/route-helpers";

interface RouteContext {
  params: { slug: string };
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireApiSession(
    "Inicia sesión para ver el checkout.",
  );
  if (!auth.ok) {
    return auth.response;
  }

  const checkout = await getCheckoutState(context.params.slug);

  if (!checkout) {
    return apiError("No hay reserva activa para esta publicación.", 404);
  }

  if (checkout.winnerId !== auth.session.user.id) {
    return apiError("Solo el ganador puede acceder al checkout.", 403);
  }

  return apiJson({
    listing: checkout.listing,
    seller: checkout.seller,
    orderStatus: checkout.orderStatus,
    paymentDeadline: checkout.paymentDeadline,
    paidAt: checkout.paidAt,
  });
}
