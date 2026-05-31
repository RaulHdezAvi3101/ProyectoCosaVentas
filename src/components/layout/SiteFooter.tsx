import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { UserMenu } from "@/features/auth/components/UserMenu";
import { getSession } from "@/features/auth/get-session";
import { MARKETPLACE_PATH } from "@/lib/constants";

export async function SiteFooter() {
  const session = await getSession();

  return (
    <footer className="mt-auto border-t border-ink/10 bg-ink text-surface/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="shrink-0 no-underline">
          <Logo variant="inverse" />
        </Link>
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <Link
            href={MARKETPLACE_PATH}
            className="text-surface/80 no-underline hover:text-surface"
          >
            Explorar
          </Link>
          <Link
            href="/sell"
            className="text-surface/80 no-underline hover:text-surface"
          >
            Vender
          </Link>
          {session ? (
            <UserMenu
              displayName={session.user.displayName}
              handle={session.user.handle}
              variant="inverse"
            />
          ) : (
            <Link
              href="/auth/login"
              className="text-surface/80 no-underline hover:text-surface"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
        <p className="text-sm text-surface/60">
          © {new Date().getFullYear()} mio — México
        </p>
      </div>
    </footer>
  );
}
