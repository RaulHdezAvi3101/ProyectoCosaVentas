import { prisma } from "@/server/db";
import type { InAppNotification, NotificationKind } from "@/types/notifications";

export interface CreateNotificationInput {
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href?: string;
}

export async function createNotification(
  input: CreateNotificationInput,
): Promise<void> {
  await prisma.inAppNotification.create({
    data: {
      userId: input.userId,
      kind: input.kind,
      title: input.title,
      body: input.body,
      href: input.href ?? "",
    },
  });
}

export async function listNotifications(
  userId: string,
  limit = 20,
): Promise<InAppNotification[]> {
  const rows = await prisma.inAppNotification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return rows.map((row) => ({
    id: row.id,
    kind: row.kind as NotificationKind,
    title: row.title,
    body: row.body,
    href: row.href,
    readAt: row.readAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  return prisma.inAppNotification.count({
    where: { userId, readAt: null },
  });
}

export async function markNotificationRead(
  userId: string,
  notificationId: string,
): Promise<boolean> {
  const result = await prisma.inAppNotification.updateMany({
    where: { id: notificationId, userId },
    data: { readAt: new Date() },
  });

  return result.count > 0;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await prisma.inAppNotification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
