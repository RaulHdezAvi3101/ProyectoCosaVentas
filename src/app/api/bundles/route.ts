import type { NextRequest } from "next/server";
import {
  createBundle,
  CreateBundleError,
} from "@/features/bundles/create-bundle";
import { getBundleBySlug } from "@/features/bundles/get-bundle";
import {
  apiError,
  apiJson,
  handleApiError,
  parseApiJsonBody,
  requireApiSession,
} from "@/lib/api/route-helpers";

export async function POST(request: NextRequest) {
  const auth = await requireApiSession("Inicia sesión para crear bundles.");
  if (!auth.ok) {
    return auth.response;
  }

  const body = await parseApiJsonBody(request);
  if (!body.ok) {
    return body.response;
  }

  const payload = body.payload;

  try {
    const bundle = await createBundle(auth.session.user.id, {
      title: String(payload.title ?? ""),
      description: String(payload.description ?? ""),
      priceCents: Number(payload.priceCents),
      listingIds: Array.isArray(payload.listingIds)
        ? payload.listingIds.map(String)
        : [],
      pickCount:
        payload.pickCount === null || payload.pickCount === undefined
          ? null
          : Number(payload.pickCount),
    });

    return apiJson({ bundle: { id: bundle.id } }, 201);
  } catch (error) {
    return handleApiError(error, {
      logTag: "[bundles POST]",
      fallbackMessage: "No se pudo crear el bundle.",
      DomainError: CreateBundleError,
    });
  }
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")?.trim();

  if (!slug) {
    return apiError("Falta slug.", 400);
  }

  const bundle = await getBundleBySlug(slug);

  if (!bundle) {
    return apiError("Bundle no encontrado.", 404);
  }

  return apiJson({ bundle });
}
