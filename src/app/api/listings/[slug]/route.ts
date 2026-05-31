import { getBySlug } from "@/features/listings/get-by-slug";
import { apiError, apiJson } from "@/lib/api/route-helpers";

interface RouteContext {
  params: { slug: string };
}

export async function GET(_request: Request, context: RouteContext) {
  const detail = await getBySlug(context.params.slug);

  if (!detail) {
    return apiError("No encontrado", 404);
  }

  return apiJson(detail);
}
