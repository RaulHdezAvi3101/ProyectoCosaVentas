import { AUTH_ERROR_MESSAGES } from "@/features/auth/errors";
import { apiJson, requireApiSession } from "@/lib/api/route-helpers";

export async function GET() {
  const auth = await requireApiSession(AUTH_ERROR_MESSAGES.unauthorized);
  if (!auth.ok) {
    return auth.response;
  }

  return apiJson({ user: auth.session.user });
}
