import { Card } from "@/components/ui/Card";
import type { Bundle } from "@/types/marketplace";
import { formatPriceMxn } from "@/lib/listings/format-price";

interface BundlePriceCompareProps {
  bundle: Bundle;
}

export function BundlePriceCompare({ bundle }: BundlePriceCompareProps) {
  const isPickLot = bundle.pickCount !== null;
  const savingsPercent =
    bundle.individualTotal > 0
      ? Math.round((bundle.savings / bundle.individualTotal) * 100)
      : 0;

  return (
    <Card>
      <h2 className="mb-4 font-display text-lg font-semibold text-ink">
        Precio del bundle
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-ink/10 bg-surface/60 p-4">
          <p className="text-sm text-ink/60">Suma individual</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-ink/70 line-through">
            {formatPriceMxn(bundle.individualTotal)}
          </p>
          <p className="mt-1 text-xs text-ink/50">
            {isPickLot
              ? `Precio de referencia (${bundle.totalCount} artículos)`
              : `${bundle.totalCount} artículos por separado`}
          </p>
        </div>
        <div className="rounded-xl border border-brand/20 bg-brand-muted p-4">
          <p className="text-sm text-brand">Precio bundle</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-brand">
            {formatPriceMxn(bundle.price)}
          </p>
          {bundle.savings > 0 ? (
            <p className="mt-1 text-xs text-brand/80">
              Ahorras {formatPriceMxn(bundle.savings)} ({savingsPercent}%)
            </p>
          ) : null}
        </div>
      </div>
      {isPickLot ? (
        <p className="mt-4 text-sm text-ink/70">
          Lote parcial: el comprador elige{" "}
          <strong>{bundle.pickCount}</strong> artículo
          {bundle.pickCount === 1 ? "" : "s"} de{" "}
          <strong>{bundle.totalCount}</strong> por el precio del bundle.
        </p>
      ) : null}
    </Card>
  );
}
