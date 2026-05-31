import { cn } from "@/lib/cn";

interface LiveBadgeProps {
  className?: string;
  size?: "sm" | "md";
}

const sizeClasses = {
  sm: "px-1.5 py-0 text-[10px] gap-1",
  md: "px-2.5 py-0.5 text-xs gap-1.5",
};

export function LiveBadge({ className, size = "md" }: LiveBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-destructive/25 bg-destructive/10 font-semibold uppercase tracking-wide text-destructive",
        sizeClasses[size],
        className,
      )}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-destructive"
        aria-hidden
      />
      En vivo
    </span>
  );
}
