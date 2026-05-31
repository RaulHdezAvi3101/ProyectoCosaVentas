import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-foreground shadow-soft hover:brightness-95 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
  secondary:
    "border border-brand bg-card text-brand hover:bg-brand/5 focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
  ghost:
    "bg-transparent text-ink/70 hover:bg-ink/5 focus-visible:ring-2 focus-visible:ring-ink/20 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "rounded-lg px-3.5 py-1.5 text-sm",
  md: "rounded-xl px-5 py-2.5 text-sm",
};

export function getButtonClassName({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  disabled,
  type = "button",
  href,
  children,
  ...props
}: ButtonProps) {
  const classes = getButtonClassName({ variant, size, className });

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      aria-disabled={disabled ? "true" : undefined}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}
