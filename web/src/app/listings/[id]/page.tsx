import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getListingBySlug, getSellerById } from "@/lib/listings/queries";
import { formatPrice } from "@/lib/marketplace/format";
import { ScoreBadge } from "@/components/reputation/ScoreBadge";
import { SellerAlert } from "@/components/reputation/SellerAlert";
import { getSellerAlert } from "@/lib/seller-alerts";
import { FirstToClaimBlock } from "@/components/listing/FirstToClaimBlock";
import { ListingLiveBadge } from "@/components/listing/ListingLiveBadge";
import { ListingLockOverlay } from "@/components/listing/ListingLockOverlay";
import { ListingRealtimeShell } from "@/components/listing/ListingRealtimeShell";
import { primaryImageUrl } from "@/lib/marketplace/images";
import { ListingDetailFooter } from "./ListingDetailFooter";

export default async function ListingPage({
  params,
}: {
  params: { id: string };
}) {
  const listing = await getListingBySlug(params.id);
  if (!listing) notFound();

  const seller = await getSellerById(listing.sellerId);
  const sellerAlert = seller ? getSellerAlert(seller) : null;
  const isLive = listing.status === "live";
  const imageSrc = primaryImageUrl(listing.imageUrls);

  return (
    <main className="mx-auto max-w-lg pb-8">
      <ListingRealtimeShell listingId={listing.id}>
        <div className="relative aspect-square bg-black/5">
          <Image
            src={imageSrc}
            alt={listing.title}
            fill
            className="object-cover"
            priority
            sizes="512px"
          />
          <ListingLockOverlay listing={listing} />
          <Link
            href="/"
            className="absolute left-3 top-3 z-20 rounded-full bg-white/90 p-2 shadow"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          {listing.firstToClaim && (
            <ListingLiveBadge initialLive={isLive} />
          )}
        </div>

        <div className="px-4 pt-4">
          <p className="text-xs font-medium text-muted">
            {listing.category} · {listing.condition}
          </p>
          <h1 className="mt-1 text-xl font-bold text-ink">{listing.title}</h1>
          <p className="mt-2 text-2xl font-bold">
            {formatPrice(listing.price, listing.currency)}
          </p>
          <p className="mt-3 text-sm text-muted">{listing.description}</p>

          <FirstToClaimBlock listing={listing} />

          {sellerAlert && (
            <div className="mt-4">
              <SellerAlert alert={sellerAlert} />
            </div>
          )}

          {seller && (
            <Link
              href={`/profile/${seller.id}`}
              className={`flex items-center justify-between rounded-xl border border-black/10 bg-white p-3 ${sellerAlert ? "mt-3" : "mt-4"}`}
            >
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <Image
                    src={seller.avatarUrl}
                    alt={seller.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold">{seller.name}</p>
                  <p className="text-xs text-muted">{seller.handle}</p>
                </div>
              </div>
              <ScoreBadge score={seller.score} tier={seller.tier} compact />
            </Link>
          )}

          <ListingDetailFooter listing={listing} />
        </div>
      </ListingRealtimeShell>
    </main>
  );
}
