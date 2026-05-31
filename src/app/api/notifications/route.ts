import {
  countUnreadNotifications,
  listNotifications,
  markAllNotificationsRead,
} from "@/features/notifications/notification-service";
import { apiJson, requireApiSession } from "@/lib/api/route-helpers";

export async function GET() {
  const auth = await requireApiSession("No autorizado.");
  if (!auth.ok) {
    return auth.response;
  }

  const [items, unreadCount] = await Promise.all([
    listNotifications(auth.session.user.id),
    countUnreadNotifications(auth.session.user.id),
  ]);

  return apiJson({ items, unreadCount });
}

export async function PATCH() {
  const auth = await requireApiSession("No autorizado.");
  if (!auth.ok) {
    return auth.response;
  }

  await markAllNotificationsRead(auth.session.user.id);

  return apiJson({ ok: true });
}
