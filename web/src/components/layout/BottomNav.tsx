"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Inbox, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth/useSession";

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useSession();

  const profileHref = user
    ? `/profile/${user.id}`
    : "/auth/login?next=/profile/me";

  const links = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/sell", label: "Vender", icon: PlusCircle },
    { href: "/seller/inbox", label: "Mensajes", icon: Inbox },
    { href: profileHref, label: "Perfil", icon: User },
  ];

  const hide =
    pathname.startsWith("/sell/camera") ||
    pathname.startsWith("/checkout/") ||
    (pathname.startsWith("/listings/") && pathname.includes("/claim")) ||
    pathname.startsWith("/auth/");

  if (hide) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/10 bg-white safe-bottom">
      <div className="mx-auto flex max-w-lg justify-around px-2 py-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href.split("?")[0]);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-xs",
                active ? "font-semibold text-accent-dark" : "text-muted"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
