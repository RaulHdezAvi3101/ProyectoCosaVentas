import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { countUnreadNotifications } from "@/features/notifications/notification-service";
import { UserMenu } from "@/features/auth/components/UserMenu";
import { getSession } from "@/features/auth/get-session";
import { MARKETPLACE_PATH, WANTS_PATH } from "@/lib/constants";

export async function SiteHeader() {
  const session = await getSession();
  const unreadCount = session
    ? await countUnreadNotifications(session.user.id)
    : 0;

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-card/80 shadow-header backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
        <Link href="/" className="shrink-0 no-underline">
          <Logo variant="brand" priority />
        </Link>
        <div className="flex flex-1 items-center justify-end gap-3 text-sm sm:gap-4">
          <Link
            href={MARKETPLACE_PATH}
            className="font-medium text-ink/80 no-underline hover:text-brand"
          >
            Explorar
          </Link>
          <Link
            href={WANTS_PATH}
            className="font-medium text-ink/80 no-underline hover:text-brand"
          >
            Busco
          </Link>

          {session ? (
            <>
              <NotificationBell initialUnreadCount={unreadCount} />
              <UserMenu
                displayName={session.user.displayName}
                handle={session.user.handle}
              />
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="font-medium text-ink/80 no-underline hover:text-brand sm:hidden"
              >
                Entrar
              </Link>
              <Link
                href="/auth/login"
                className="hidden font-medium text-ink/80 no-underline hover:text-brand sm:inline"
              >
                Iniciar sesión
              </Link>
            </>
          )}

          <Button href="/sell" size="sm">
            Vender
          </Button>
        </div>
      </nav>
    </header>
  );
}
