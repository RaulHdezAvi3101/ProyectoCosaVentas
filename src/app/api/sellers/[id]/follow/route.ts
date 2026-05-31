import type { NextRequest } from "next/server";
import { getSession } from "@/features/auth/get-session";
import {
  followSeller,
  isFollowingSeller,
  unfollowSeller,
} from "@/features/seller/follow-seller";
import { apiError, apiJson, requireApiSession } from "@/lib/api/route-helpers";

interface RouteParams {
  params: { id: string };
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireApiSession(
    "Inicia sesión para seguir vendedores.",
  );
  if (!auth.ok) {
    return auth.response;
  }

  try {
    await followSeller(auth.session.user.id, params.id);
    return apiJson({ following: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo seguir al vendedor.";
    return apiError(message, 400);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireApiSession("Inicia sesión para dejar de seguir.");
  if (!auth.ok) {
    return auth.response;
  }

  await unfollowSeller(auth.session.user.id, params.id);
  return apiJson({ following: false });
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await getSession();

  if (!session) {
    return apiJson({ following: false });
  }

  const following = await isFollowingSeller(session.user.id, params.id);

  return apiJson({ following });
}
