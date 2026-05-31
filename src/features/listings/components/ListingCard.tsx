import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { LiveBadge } from "@/components/ui/LiveBadge";
import { Card } from "@/components/ui/Card";
import { ListingSellerMeta } from "@/features/listings/components/ListingSellerMeta";
import { formatPriceMxn } from "@/lib/listings/format-price";
import { FTC_LABEL } from "@/lib/constants/marketplace-copy";
import type { Listing } from "@/types/marketplace";

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const coverUrl = listing.imageUrls[0];
  const showLiveBadge = listing.status === "live";

  return (
    <Link href={`/listings/${listing.id}`} className="group block no-underline">
      <Card className="overflow-hidden p-0 transition-shadow group-hover:shadow-md">
        <div className="relative aspect-square bg-surface">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={listing.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-ink/40">
              Sin imagen
            </div>
          )}
          {showLiveBadge ? (
            <LiveBadge className="absolute left-3 top-3" />
          ) : listing.firstToClaim ? (
            <Badge variant="reserved" className="absolute left-3 top-3">
              {FTC_LABEL}
            </Badge>
          ) : null}
        </div>
        <div className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/60">
            {listing.category}
          </p>
          <h3 className="font-display line-clamp-2 font-semibold text-ink group-hover:text-brand">
            {listing.title}
          </h3>
          {listing.seller ? (
            <ListingSellerMeta seller={listing.seller} className="mt-1.5" />
          ) : null}
          <p className="mt-2 font-display text-lg font-semibold tabular-nums text-ink">
            {formatPriceMxn(Math.round(listing.price * 100), listing.currency)}
          </p>
        </div>
      </Card>
    </Link>
  );
}
