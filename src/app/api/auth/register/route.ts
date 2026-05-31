import type { NextRequest } from "next/server";
import {
  authErrorResponse,
  authSuccessResponse,
  getRequestMeta,
} from "@/features/auth/api-helpers";
import { register } from "@/features/auth/register";
import { parseRegisterInput } from "@/features/auth/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = parseRegisterInput(body);
    const result = await register(input, getRequestMeta(request));
    return authSuccessResponse(result.sessionToken);
  } catch (error) {
    return authErrorResponse(error);
  }
}
