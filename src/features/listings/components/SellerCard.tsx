import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { Seller } from "@/types/marketplace";

interface SellerCardProps {
  seller: Seller;
}

export function SellerCard({ seller }: SellerCardProps) {
  const initial = seller.name.charAt(0).toUpperCase();

  return (
    <Card>
      <h2 className="mb-4 font-display text-lg font-semibold text-ink">
        Vendedor
      </h2>
      <div className="flex items-start gap-4">
        {seller.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={seller.avatarUrl}
            alt=""
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-lg font-semibold text-brand">
            {initial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <Link
            href={`/profile/${seller.id}`}
            className="font-display text-lg font-semibold text-ink no-underline hover:text-brand"
          >
            {seller.name}
          </Link>
          <p className="text-sm text-ink/70">{seller.handle}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="neutral" className="capitalize">
              {seller.tier}
            </Badge>
            <span className="text-sm text-ink/60">
              Puntaje {seller.score} · {seller.sales} ventas
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
