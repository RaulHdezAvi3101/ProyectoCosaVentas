import { markNotificationRead } from "@/features/notifications/notification-service";
import { apiError, apiJson, requireApiSession } from "@/lib/api/route-helpers";

interface RouteParams {
  params: { id: string };
}

export async function PATCH(_request: Request, { params }: RouteParams) {
  const auth = await requireApiSession("No autorizado.");
  if (!auth.ok) {
    return auth.response;
  }

  const updated = await markNotificationRead(auth.session.user.id, params.id);

  if (!updated) {
    return apiError("Notificación no encontrada.", 404);
  }

  return apiJson({ ok: true });
}
