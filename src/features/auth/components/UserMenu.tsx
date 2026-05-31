"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { getButtonClassName } from "@/components/ui/Button";
import { useLogout } from "@/features/auth/components/use-logout";

interface UserMenuProps {
  displayName: string;
  handle: string;
  variant?: "default" | "inverse";
}

const menuItemClass = {
  default:
    "flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-ink/80 no-underline transition hover:bg-ink/5 hover:text-brand",
  inverse:
    "flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-surface/80 no-underline transition hover:bg-surface/10 hover:text-surface",
};

export function UserMenu({
  displayName,
  handle,
  variant = "default",
}: UserMenuProps) {
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { logout, loading } = useLogout();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function handleLogout() {
    setOpen(false);
    await logout();
  }

  const triggerClassName =
    variant === "inverse"
      ? getButtonClassName({
          variant: "ghost",
          size: "sm",
          className:
            "max-w-[11rem] gap-1.5 text-surface/80 hover:bg-surface/10 hover:text-surface",
        })
      : getButtonClassName({
          variant: "secondary",
          size: "sm",
          className: "max-w-[11rem] gap-1.5",
        });

  const panelClassName = cn(
    "absolute right-0 top-[calc(100%+0.375rem)] z-50 min-w-[12rem] rounded-xl border p-1 shadow-soft",
    variant === "inverse"
      ? "border-surface/15 bg-ink"
      : "border-ink/10 bg-card",
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={`${menuId}-trigger`}
        className={triggerClassName}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={`${menuId}-menu`}
        title={displayName}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="truncate">{displayName}</span>
        <span
          aria-hidden
          className={cn(
            "text-xs transition-transform",
            open && "rotate-180",
            variant === "inverse" ? "text-surface/60" : "text-ink/50",
          )}
        >
          ▾
        </span>
      </button>

      {open ? (
        <div
          id={`${menuId}-menu`}
          role="menu"
          aria-labelledby={`${menuId}-trigger`}
          className={panelClassName}
        >
          <p
            className={cn(
              "truncate px-3 py-2 text-xs",
              variant === "inverse" ? "text-surface/50" : "text-ink/50",
            )}
          >
            @{handle}
          </p>
          <Link
            href="/profile/me"
            role="menuitem"
            className={menuItemClass[variant]}
            onClick={() => setOpen(false)}
          >
            Mi perfil
          </Link>
          <button
            type="button"
            role="menuitem"
            disabled={loading}
            className={cn(menuItemClass[variant], "disabled:opacity-50")}
            onClick={handleLogout}
          >
            {loading ? "Saliendo…" : "Cerrar sesión"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
