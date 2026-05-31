import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type BadgeVariant =
  | "live"
  | "reserved"
  | "released"
  | "sold"
  | "neutral";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  live: "border-brand/20 bg-brand-muted text-brand",
  reserved: "border-accent/30 bg-accent/15 text-ink",
  released: "border-brand/15 bg-brand/10 text-brand",
  sold: "border-ink/10 bg-ink/5 text-ink/70",
  neutral: "border-ink/10 bg-surface text-ink/70",
};

export function Badge({
  variant = "neutral",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
