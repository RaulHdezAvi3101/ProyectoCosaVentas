import { getWantBySlug } from "@/features/wants/list-wants";
import { apiError, apiJson } from "@/lib/api/route-helpers";

interface RouteParams {
  params: { slug: string };
}

export async function GET(_request: Request, { params }: RouteParams) {
  const detail = await getWantBySlug(params.slug);

  if (!detail) {
    return apiError("Búsqueda no encontrada.", 404);
  }

  return apiJson({
    want: detail.want,
    offerCount: detail.offers.length,
  });
}
