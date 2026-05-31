import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SoldOverlay } from "@/components/ui/Overlays";
import { getSession } from "@/features/auth/get-session";
import { isWinnerForListing } from "@/features/checkout/is-winner-for-listing";
import { getBySlug } from "@/features/listings/get-by-slug";
import { ListingImageGallery } from "@/features/listings/components/ListingImageGallery";
import { ListingStickyCta } from "@/features/listings/components/ListingStickyCta";
import { SellerCard } from "@/features/listings/components/SellerCard";
import { formatPriceMxn } from "@/lib/listings/format-price";
import { MARKETPLACE_PATH } from "@/lib/constants";
import { FTC_LABEL } from "@/lib/constants/marketplace-copy";

interface ListingPageProps {
  params: { slug: string };
}

export default async function ListingPage({ params }: ListingPageProps) {
  if (!params.slug) {
    notFound();
  }

  const detail = await getBySlug(params.slug);

  if (!detail) {
    notFound();
  }

  const { listing, seller } = detail;
  const session = await getSession();
  const isWinner =
    session && listing.status === "locked"
      ? await isWinnerForListing(listing.id, session.user.id)
      : false;
  const priceLabel = formatPriceMxn(
    Math.round(listing.price * 100),
    listing.currency,
  );

  return (
    <section className="mx-auto max-w-6xl px-6 py-10 pb-32 lg:pb-10">
      <nav className="mb-6 text-sm text-ink/60">
        <Link href={MARKETPLACE_PATH} className="text-brand no-underline hover:underline">
          Explorar
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink/70">{listing.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <ListingImageGallery
            title={listing.title}
            imageUrls={listing.imageUrls}
            isLive={listing.status === "live"}
          />

          <Card>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
              {listing.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="neutral">{listing.category}</Badge>
              <Badge variant="neutral">{listing.condition}</Badge>
              {listing.firstToClaim ? (
                <Badge variant="reserved">{FTC_LABEL}</Badge>
              ) : null}
            </div>
            <p className="mt-6 whitespace-pre-wrap text-ink/70">
              {listing.description}
            </p>
          </Card>
        </div>

        <aside className="flex flex-col gap-6">
          <Card>
            <p className="font-display text-3xl font-semibold tabular-nums text-brand">
              {priceLabel}
            </p>
            <p className="mt-1 text-sm text-ink/60">
              {listing.quantity === 1 ? "1 unidad disponible" : `${listing.quantity} unidades`}
            </p>

            {listing.firstToClaim && listing.phraseHidden ? (
              <p className="mt-4 rounded-lg bg-surface px-3 py-2 text-sm text-ink/70">
                Frase de reclamo: <span className="font-mono">●●●●●●</span>
              </p>
            ) : null}

            {listing.status === "sold" ? (
              <SoldOverlay
                title="Vendido"
                description="Esta publicación ya fue comprada."
              />
            ) : null}

            <div className="mt-6 hidden lg:block">
              {isWinner ? (
                <Button href={`/checkout/${listing.id}`} variant="primary" className="w-full">
                  Pagar ahora
                </Button>
              ) : listing.status === "live" && listing.firstToClaim ? (
                <Button
                  href={`/listings/${listing.id}/claim`}
                  variant="primary"
                  className="w-full"
                >
                  Reclamar ahora
                </Button>
              ) : listing.status === "locked" ? (
                <Button variant="secondary" className="w-full" disabled>
                  Reservado — plazo de pago activo
                </Button>
              ) : (
                <Button variant="secondary" className="w-full" disabled>
                  Comprar — próximamente
                </Button>
              )}
            </div>
          </Card>

          <SellerCard seller={seller} />
        </aside>
      </div>

      <ListingStickyCta
        listingId={listing.id}
        title={listing.title}
        priceLabel={priceLabel}
        status={listing.status}
        firstToClaim={listing.firstToClaim}
        isWinner={isWinner}
      />
    </section>
  );
}
