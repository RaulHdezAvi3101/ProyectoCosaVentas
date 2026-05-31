import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatPriceMxn } from "@/lib/listings/format-price";
import type { WantListItem } from "@/types/wants";

interface WantCardProps {
  want: WantListItem;
}

export function WantCard({ want }: WantCardProps) {
  const initial = want.author?.name.charAt(0).toUpperCase() ?? "?";

  return (
    <Link href={`/wants/${want.id}`} className="group block no-underline">
      <Card className="flex h-full flex-col transition-shadow group-hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/60">
            {want.category}
          </p>
          <Badge variant="neutral">Busco</Badge>
        </div>
        <h3 className="mt-2 font-display line-clamp-2 font-semibold text-ink group-hover:text-brand">
          {want.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-ink/70">{want.description}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-ink/60">Precio objetivo</dt>
            <dd className="font-semibold tabular-nums text-brand">
              {formatPriceMxn(want.targetPrice, want.currency)}
            </dd>
          </div>
          <div>
            <dt className="text-ink/60">Estado deseado</dt>
            <dd className="font-medium text-ink">{want.desiredCondition}</dd>
          </div>
        </dl>
        <div className="mt-auto flex items-center justify-between border-t border-ink/5 pt-4">
          {want.author ? (
            <div className="flex min-w-0 items-center gap-2">
              {want.author.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={want.author.avatarUrl}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand">
                  {initial}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  {want.author.name}
                </p>
                <p className="truncate text-xs text-ink/60">{want.author.handle}</p>
              </div>
            </div>
          ) : null}
          {want.offerCount !== undefined ? (
            <span className="shrink-0 text-xs text-ink/50">
              {want.offerCount} oferta{want.offerCount === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
      </Card>
    </Link>
  );
}
