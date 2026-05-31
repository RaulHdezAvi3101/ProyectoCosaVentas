import type { NextRequest } from "next/server";
import {
  authErrorResponse,
  authSuccessResponse,
  getRequestMeta,
} from "@/features/auth/api-helpers";
import { login } from "@/features/auth/login";
import { parseLoginInput } from "@/features/auth/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = parseLoginInput(body);
    const result = await login(input, getRequestMeta(request));
    return authSuccessResponse(result.sessionToken);
  } catch (error) {
    return authErrorResponse(error);
  }
}
