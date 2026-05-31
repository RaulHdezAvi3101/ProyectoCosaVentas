import { Button } from "@/components/ui/Button";
import type { Listing } from "@/types/marketplace";

interface ListingStickyCtaProps {
  listingId: string;
  title: string;
  priceLabel: string;
  status: Listing["status"];
  firstToClaim: boolean;
  isWinner: boolean;
}

export function ListingStickyCta({
  listingId,
  title,
  priceLabel,
  status,
  firstToClaim,
  isWinner,
}: ListingStickyCtaProps) {
  if (status === "sold") {
    return null;
  }

  const action = getPurchaseAction({
    listingId,
    status,
    firstToClaim,
    isWinner,
  });

  if (!action) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-card/95 px-4 py-3 shadow-[0_-8px_24px_rgba(17,17,17,0.08)] backdrop-blur-sm lg:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      role="region"
      aria-label="Acción de compra"
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{title}</p>
          <p className="text-lg font-semibold tabular-nums text-brand">
            {priceLabel}
          </p>
        </div>
        {action.href ? (
          <Button href={action.href} className="min-h-12 shrink-0 px-6">
            {action.label}
          </Button>
        ) : (
          <Button disabled className="min-h-12 shrink-0 px-4 text-sm">
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}

function getPurchaseAction({
  listingId,
  status,
  firstToClaim,
  isWinner,
}: {
  listingId: string;
  status: Listing["status"];
  firstToClaim: boolean;
  isWinner: boolean;
}): { label: string; href?: string } | null {
  if (isWinner) {
    return { label: "Pagar ahora", href: `/checkout/${listingId}` };
  }

  if (status === "live" && firstToClaim) {
    return { label: "Reclamar", href: `/listings/${listingId}/claim` };
  }

  if (status === "locked") {
    return { label: "Reservado" };
  }

  if (status === "live") {
    return { label: "Próximamente" };
  }

  return null;
}
