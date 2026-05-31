import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { getSession } from "@/features/auth/get-session";
import { listNotifications } from "@/features/notifications/notification-service";
import { cn } from "@/lib/cn";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default async function NotificationsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login?next=/notifications");
  }

  const items = await listNotifications(session.user.id, 50);

  return (
    <section className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wide text-brand">
          Centro de avisos
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          Notificaciones
        </h1>
      </div>

      {items.length === 0 ? (
        <Card>
          <p className="text-sm text-ink/70">No tienes notificaciones todavía.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((notification) => {
            const className = cn(
              "block rounded-xl border p-4 no-underline transition",
              notification.readAt
                ? "border-ink/5 bg-card"
                : "border-brand/20 bg-brand-muted/30",
            );

            const inner = (
              <>
                <p className="font-medium text-ink">{notification.title}</p>
                <p className="mt-1 text-sm text-ink/70">{notification.body}</p>
                <p className="mt-2 text-xs text-ink/50">
                  {formatDate(notification.createdAt)}
                </p>
              </>
            );

            if (notification.href) {
              return (
                <Link key={notification.id} href={notification.href} className={className}>
                  {inner}
                </Link>
              );
            }

            return (
              <div key={notification.id} className={className}>
                {inner}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
