import Link from "next/link";
import { cn } from "@/lib/cn";

const pillBase =
  "rounded-full border px-3 py-1.5 text-sm font-medium no-underline transition-colors";

export function categoryFilterLinkClass(active: boolean): string {
  return cn(
    pillBase,
    active
      ? "border-brand bg-brand-muted text-brand"
      : "border-ink/10 bg-card text-ink/70 hover:border-brand/30 hover:text-brand",
  );
}

interface CategoryFilterNavProps {
  ariaLabel: string;
  children: React.ReactNode;
}

export function CategoryFilterNav({ ariaLabel, children }: CategoryFilterNavProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="navigation"
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}

interface CategoryFilterLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

export function CategoryFilterLink({
  href,
  active,
  children,
}: CategoryFilterLinkProps) {
  return (
    <Link href={href} className={categoryFilterLinkClass(active)}>
      {children}
    </Link>
  );
}
