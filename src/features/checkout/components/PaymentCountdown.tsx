"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

interface PaymentCountdownProps {
  deadlineMs: number;
  onExpired?: () => void;
  className?: string;
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function PaymentCountdown({
  deadlineMs,
  onExpired,
  className,
}: PaymentCountdownProps) {
  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(0, deadlineMs - Date.now()),
  );

  useEffect(() => {
    const tick = () => {
      const next = Math.max(0, deadlineMs - Date.now());
      setRemainingMs(next);

      if (next === 0) {
        onExpired?.();
      }
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [deadlineMs, onExpired]);

  const expired = remainingMs === 0;
  const urgent = remainingMs > 0 && remainingMs <= 5 * 60 * 1000;

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3",
        expired
          ? "border-destructive/30 bg-destructive/5"
          : urgent
            ? "border-accent/40 bg-accent/10"
            : "border-brand/20 bg-brand-muted",
        className,
      )}
      role="timer"
      aria-live="polite"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">
        Plazo de pago
      </p>
      <p
        className={cn(
          "mt-1 font-display text-3xl font-semibold tabular-nums",
          expired ? "text-destructive" : urgent ? "text-accent" : "text-brand",
        )}
      >
        {expired ? "Expirado" : formatRemaining(remainingMs)}
      </p>
      {!expired ? (
        <p className="mt-1 text-sm text-ink/60">
          Completa el pago antes de que se libere la reserva.
        </p>
      ) : null}
    </div>
  );
}
