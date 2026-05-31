import { cn } from "@/lib/cn";

interface SellSectionHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
}

export function SellSectionHeader({
  eyebrow,
  title,
  description,
  className,
}: SellSectionHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      <p className="text-sm font-medium uppercase tracking-wide text-brand">
        {eyebrow}
      </p>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
        {title}
      </h1>
      <p className="mt-2 text-ink/70">{description}</p>
    </div>
  );
}
