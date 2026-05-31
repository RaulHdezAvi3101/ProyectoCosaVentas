import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AuthError, AUTH_ERROR_MESSAGES } from "@/features/auth/errors";
import { buildClearSessionCookie, buildSessionCookie } from "@/lib/auth/session-cookie";
import { apiError } from "@/lib/api/route-helpers";

export function getRequestMeta(request: NextRequest) {
  return {
    userAgent: request.headers.get("user-agent") ?? undefined,
    ip:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      undefined,
  };
}

export function authSuccessResponse(sessionToken: string) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(buildSessionCookie(sessionToken));
  return response;
}

export function authLogoutResponse() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(buildClearSessionCookie());
  return response;
}

export function authErrorResponse(error: unknown) {
  if (error instanceof AuthError) {
    return apiError(error.message, error.status);
  }

  if (error instanceof Error && error.message === "invalid") {
    return apiError(AUTH_ERROR_MESSAGES.invalidInput, 400);
  }

  console.error("[auth]", error);
  return apiError("Ocurrió un error. Intenta de nuevo.", 500);
}
