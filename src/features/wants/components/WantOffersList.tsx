import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { WantOfferActions } from "@/features/wants/components/WantOfferActions";
import { formatPriceMxn } from "@/lib/listings/format-price";
import type { WantOffer } from "@/types/wants";

interface WantOffersListProps {
  wantSlug: string;
  offers: WantOffer[];
  isOwner: boolean;
  wantActive: boolean;
}

const STATUS_LABELS: Record<WantOffer["status"], string> = {
  pending: "Pendiente",
  accepted: "Aceptada",
  rejected: "Rechazada",
  withdrawn: "Retirada",
};

const STATUS_VARIANT: Record<
  WantOffer["status"],
  "neutral" | "live" | "sold"
> = {
  pending: "neutral",
  accepted: "live",
  rejected: "sold",
  withdrawn: "neutral",
};

export function WantOffersList({
  wantSlug,
  offers,
  isOwner,
  wantActive,
}: WantOffersListProps) {
  if (offers.length === 0) {
    return (
      <Card>
        <p className="text-sm text-ink/70">
          {isOwner
            ? "Aún no hay ofertas. Los vendedores verán tu búsqueda en el feed público."
            : "Sé el primero en hacer una oferta directa."}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => {
        const initial = offer.seller?.name.charAt(0).toUpperCase() ?? "?";
        const showActions =
          isOwner && wantActive && offer.status === "pending";

        return (
          <Card key={offer.id}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                {offer.seller?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={offer.seller.avatarUrl}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
                    {initial}
                  </div>
                )}
                <div>
                  {offer.seller ? (
                    <Link
                      href={`/profile/${offer.seller.id}`}
                      className="font-medium text-ink no-underline hover:text-brand"
                    >
                      {offer.seller.name}
                    </Link>
                  ) : null}
                  <p className="text-xs text-ink/60">{offer.seller?.handle}</p>
                  <p className="mt-2 text-sm text-ink/80">{offer.message}</p>
                  {offer.listingId ? (
                    <Link
                      href={`/listings/${offer.listingId}`}
                      className="mt-2 inline-block text-sm text-brand no-underline hover:underline"
                    >
                      Ver publicación: {offer.listingTitle}
                    </Link>
                  ) : null}
                </div>
              </div>
              <div className="shrink-0 sm:text-right">
                <p className="text-lg font-semibold tabular-nums text-brand">
                  {formatPriceMxn(offer.price, offer.currency)}
                </p>
                <Badge
                  variant={STATUS_VARIANT[offer.status]}
                  className="mt-2"
                >
                  {STATUS_LABELS[offer.status]}
                </Badge>
                {showActions ? (
                  <div className="mt-3">
                    <WantOfferActions
                      wantSlug={wantSlug}
                      offerId={offer.id}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
