import Image from "next/image";
import Link from "next/link";
import { Eye, Zap } from "lucide-react";
import { formatPrice } from "@/lib/marketplace/format";
import { primaryImageUrl } from "@/lib/marketplace/images";
import { getSellerById } from "@/lib/listings/queries";
import type { Listing, Seller } from "@/types/marketplace";
import { ScoreBadge } from "@/components/reputation/ScoreBadge";
import { SellerAlert } from "@/components/reputation/SellerAlert";
import { getSellerAlert } from "@/lib/seller-alerts";

export async function ListingCard({
  listing,
  seller: sellerProp,
}: {
  listing: Listing;
  seller?: Seller;
}) {
  const seller = sellerProp ?? (await getSellerById(listing.sellerId));
  const sellerAlert = seller ? getSellerAlert(seller) : null;

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="block overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm transition hover:border-accent/40"
    >
      <div className="relative aspect-square">
        <Image
          src={primaryImageUrl(listing.imageUrls)}
          alt={listing.title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 50vw, 25vw"
        />
        {listing.status === "live" && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-coral px-2 py-0.5 text-xs font-bold text-white animate-pulseLive">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            LIVE
          </span>
        )}
        {listing.status === "locked" && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
            Reclamado
          </span>
        )}
        {listing.firstToClaim && listing.status !== "locked" && (
          <span className="absolute right-2 top-2 flex items-center gap-0.5 rounded-full bg-accent-light px-2 py-0.5 text-[10px] font-semibold text-accent-dark">
            <Zap className="h-3 w-3" />
            First to Claim
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="line-clamp-1 text-sm font-semibold text-ink">{listing.title}</p>
        <p className="mt-0.5 text-sm font-bold text-ink">
          {formatPrice(listing.price, listing.currency)}
        </p>
        {seller && (
          <>
            <div className="mt-2 flex items-center justify-between gap-2">
              <ScoreBadge score={seller.score} tier={seller.tier} compact />
              {listing.viewers != null && listing.viewers > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-muted">
                  <Eye className="h-3 w-3" />
                  {listing.viewers}
                </span>
              )}
            </div>
            {sellerAlert && <SellerAlert alert={sellerAlert} compact />}
          </>
        )}
      </div>
    </Link>
  );
}
