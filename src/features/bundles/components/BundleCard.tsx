import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { Bundle } from "@/types/marketplace";
import { formatPriceMxn } from "@/lib/listings/format-price";

interface BundleCardProps {
  bundle: Bundle;
}

export function BundleCard({ bundle }: BundleCardProps) {
  const coverUrl = bundle.items[0]?.imageUrls[0];
  const isPickLot = bundle.pickCount !== null;

  return (
    <Card className="flex h-full flex-col overflow-hidden p-0">
      <Link
        href={`/bundles/${bundle.id}`}
        className="block no-underline"
      >
        <div className="relative aspect-square bg-surface">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-ink/40">
              Bundle
            </div>
          )}
          <div className="absolute left-2 top-2">
            <Badge variant="live">Bundle</Badge>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-2 font-display text-base font-semibold text-ink">
            {bundle.title}
          </h3>
          {isPickLot ? (
            <p className="mt-1 text-xs text-ink/60">
              Elige {bundle.pickCount} de {bundle.totalCount} artículos
            </p>
          ) : (
            <p className="mt-1 text-xs text-ink/60">
              {bundle.totalCount} artículos incluidos
            </p>
          )}
          <div className="mt-auto pt-3">
            <p className="text-lg font-semibold tabular-nums text-brand">
              {formatPriceMxn(bundle.price)}
            </p>
            {bundle.savings > 0 ? (
              <p className="text-xs text-ink/50 line-through">
                {formatPriceMxn(bundle.individualTotal)} individual
              </p>
            ) : null}
          </div>
        </div>
      </Link>
    </Card>
  );
}
