import { cn } from "@/lib/cn";
import type { ListingSellerPreview } from "@/types/marketplace";

interface ListingSellerMetaProps {
  seller: ListingSellerPreview;
  size?: "sm" | "md";
  className?: string;
}

export function ListingSellerMeta({
  seller,
  size = "md",
  className,
}: ListingSellerMetaProps) {
  return (
    <p
      className={cn(
        "truncate text-ink/55",
        size === "sm" ? "text-[10px]" : "text-xs",
        className,
      )}
    >
      <span className="font-medium text-ink/70">{seller.name}</span>
      <span aria-hidden="true"> · </span>
      <span className="tabular-nums">{seller.score} pts</span>
    </p>
  );
}
