import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/features/auth/get-session";
import type { AuthSession } from "@/features/auth/types";

export const API_INVALID_REQUEST = "Solicitud inválida.";

export function apiError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function apiJson<T>(body: T, status = 200): NextResponse {
  return NextResponse.json(body, { status });
}

type ApiSessionResult =
  | { ok: true; session: AuthSession }
  | { ok: false; response: NextResponse };

export async function requireApiSession(
  unauthorizedMessage: string,
): Promise<ApiSessionResult> {
  const session = await getSession();

  if (!session) {
    return { ok: false, response: apiError(unauthorizedMessage, 401) };
  }

  return { ok: true, session };
}

type ApiJsonBodyResult =
  | { ok: true; payload: Record<string, unknown> }
  | { ok: false; response: NextResponse };

export async function parseApiJsonBody(
  request: NextRequest,
  invalidMessage = API_INVALID_REQUEST,
): Promise<ApiJsonBodyResult> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return { ok: false, response: apiError(invalidMessage, 400) };
  }

  if (!body || typeof body !== "object") {
    return { ok: false, response: apiError(invalidMessage, 400) };
  }

  return { ok: true, payload: body as Record<string, unknown> };
}

/** JSON body optional; invalid JSON still returns 400. Non-objects yield null payload. */
export async function tryParseApiJsonBody(
  request: NextRequest,
): Promise<
  | { ok: true; payload: Record<string, unknown> | null }
  | { ok: false; response: NextResponse }
> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return { ok: false, response: apiError(API_INVALID_REQUEST, 400) };
  }

  if (!body || typeof body !== "object") {
    return { ok: true, payload: null };
  }

  return { ok: true, payload: body as Record<string, unknown> };
}

export interface StatusError extends Error {
  readonly status: number;
}

export function isStatusError(error: unknown): error is StatusError {
  return (
    error instanceof Error &&
    "status" in error &&
    typeof (error as StatusError).status === "number"
  );
}

export function handleApiError(
  error: unknown,
  options: {
    logTag: string;
    fallbackMessage: string;
    DomainError?: abstract new (...args: never[]) => Error;
    formatDomain?: (error: StatusError) => Record<string, unknown>;
  },
): NextResponse {
  const { logTag, fallbackMessage, DomainError, formatDomain } = options;

  if (DomainError && error instanceof DomainError && isStatusError(error)) {
    const body = formatDomain
      ? formatDomain(error)
      : { error: error.message };

    return NextResponse.json(body, { status: error.status });
  }

  console.error(logTag, error);
  return apiError(fallbackMessage, 500);
}
