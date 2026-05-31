import type { NextRequest } from "next/server";
import { createWant, CreateWantError } from "@/features/wants/create-want";
import { listWants } from "@/features/wants/list-wants";
import {
  apiJson,
  handleApiError,
  parseApiJsonBody,
  requireApiSession,
} from "@/lib/api/route-helpers";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "16");
  const category = searchParams.get("category")?.trim() || undefined;

  const result = await listWants({ page, pageSize, category });

  return apiJson(result);
}

export async function POST(request: NextRequest) {
  const auth = await requireApiSession(
    "Inicia sesión para publicar una búsqueda.",
  );
  if (!auth.ok) {
    return auth.response;
  }

  const body = await parseApiJsonBody(request);
  if (!body.ok) {
    return body.response;
  }

  const payload = body.payload;

  try {
    const want = await createWant(auth.session.user.id, {
      title: String(payload.title ?? ""),
      description: String(payload.description ?? ""),
      category: String(payload.category ?? ""),
      desiredCondition: String(payload.desiredCondition ?? ""),
      targetPriceCents: Number(payload.targetPriceCents),
    });

    return apiJson({ want: { id: want.id } }, 201);
  } catch (error) {
    return handleApiError(error, {
      logTag: "[wants POST]",
      fallbackMessage: "No se pudo publicar la búsqueda.",
      DomainError: CreateWantError,
    });
  }
}
