import type { NextRequest } from "next/server";
import {
  createListing,
  CreateListingError,
} from "@/features/listings/create-listing";
import { listFeed } from "@/features/listings/list-feed";
import {
  apiJson,
  handleApiError,
  parseApiJsonBody,
  requireApiSession,
} from "@/lib/api/route-helpers";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "12");
  const sellerId = searchParams.get("seller")?.trim() || undefined;
  const category = searchParams.get("category")?.trim() || undefined;

  const result = await listFeed({ page, pageSize, sellerId, category });

  return apiJson(result);
}

export async function POST(request: NextRequest) {
  const auth = await requireApiSession("Inicia sesión para publicar.");
  if (!auth.ok) {
    return auth.response;
  }

  const body = await parseApiJsonBody(request);
  if (!body.ok) {
    return body.response;
  }

  const payload = body.payload;

  try {
    const listing = await createListing(auth.session.user.id, {
      title: String(payload.title ?? ""),
      description: String(payload.description ?? ""),
      priceCents: Number(payload.priceCents),
      category: String(payload.category ?? ""),
      condition: String(payload.condition ?? ""),
      imageUrls: Array.isArray(payload.imageUrls)
        ? payload.imageUrls.map(String)
        : [],
      firstToClaim: Boolean(payload.firstToClaim),
      claimPhrase:
        typeof payload.claimPhrase === "string" ? payload.claimPhrase : undefined,
      phraseHidden:
        payload.phraseHidden === undefined
          ? true
          : Boolean(payload.phraseHidden),
    });

    return apiJson({ listing }, 201);
  } catch (error) {
    return handleApiError(error, {
      logTag: "[listings POST]",
      fallbackMessage: "No se pudo publicar. Intenta de nuevo.",
      DomainError: CreateListingError,
    });
  }
}
