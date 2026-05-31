"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { InAppNotification } from "@/types/notifications";

interface NotificationBellProps {
  initialUnreadCount: number;
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) {
    return "Ahora";
  }

  if (minutes < 60) {
    return `Hace ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `Hace ${hours} h`;
  }

  const days = Math.floor(hours / 24);
  return `Hace ${days} d`;
}

export function NotificationBell({ initialUnreadCount }: NotificationBellProps) {
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [items, setItems] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/notifications");
      const data = (await response.json()) as {
        items?: InAppNotification[];
        unreadCount?: number;
      };

      if (response.ok) {
        setItems(data.items ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    void fetchNotifications();
  }, [open, fetchNotifications]);

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

  async function handleMarkAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setUnreadCount(0);
    setItems((current) =>
      current.map((item) => ({
        ...item,
        readAt: item.readAt ?? new Date().toISOString(),
      })),
    );
  }

  async function handleItemClick(notification: InAppNotification) {
    if (!notification.readAt) {
      await fetch(`/api/notifications/${notification.id}`, { method: "PATCH" });
      setUnreadCount((count) => Math.max(0, count - 1));
      setItems((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, readAt: new Date().toISOString() }
            : item,
        ),
      );
    }

    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={`${menuId}-trigger`}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink/10 bg-card text-ink/80 transition hover:border-brand/30 hover:text-brand"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={`${menuId}-menu`}
        aria-label={
          unreadCount > 0
            ? `Notificaciones, ${unreadCount} sin leer`
            : "Notificaciones"
        }
        onClick={() => setOpen((value) => !value)}
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        >
          <path d="M15 17H9l-1 4h8l-1-4Z" />
          <path d="M12 3a5 5 0 0 1 5 5v3.5l1.5 2.5H5.5L7 11.5V8a5 5 0 0 1 5-5Z" />
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={`${menuId}-menu`}
          role="menu"
          className="absolute right-0 top-[calc(100%+0.375rem)] z-50 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-xl border border-ink/10 bg-card shadow-soft"
        >
          <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
            <p className="text-sm font-semibold text-ink">Notificaciones</p>
            {unreadCount > 0 ? (
              <button
                type="button"
                className="text-xs font-medium text-brand hover:underline"
                onClick={() => void handleMarkAllRead()}
              >
                Marcar todas leídas
              </button>
            ) : null}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-ink/60">
                Cargando…
              </p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-ink/60">
                No tienes notificaciones.
              </p>
            ) : (
              items.map((notification) => {
                const content = (
                  <>
                    <p className="text-sm font-medium text-ink">
                      {notification.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-ink/70">
                      {notification.body}
                    </p>
                    <p className="mt-1 text-[11px] text-ink/50">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </>
                );

                const className = cn(
                  "block border-b border-ink/5 px-4 py-3 text-left transition last:border-b-0",
                  notification.readAt ? "bg-card" : "bg-brand-muted/40",
                  notification.href && "hover:bg-surface/80",
                );

                if (notification.href) {
                  return (
                    <Link
                      key={notification.id}
                      href={notification.href}
                      role="menuitem"
                      className={cn(className, "no-underline")}
                      onClick={() => void handleItemClick(notification)}
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <div key={notification.id} role="menuitem" className={className}>
                    {content}
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-ink/10 px-4 py-2">
            <Link
              href="/notifications"
              className="text-xs font-medium text-brand no-underline hover:underline"
              onClick={() => setOpen(false)}
            >
              Ver todas
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
