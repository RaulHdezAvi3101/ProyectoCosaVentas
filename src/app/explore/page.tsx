import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicProfile } from "@/features/auth/get-public-profile";
import { getCheckoutFlashMessage } from "@/features/checkout/flash-messages";
import { listFeed } from "@/features/listings/list-feed";
import { listFeatured } from "@/features/listings/list-featured";
import { ListingCard } from "@/features/listings/components/ListingCard";
import { FeaturedProductsCarousel } from "@/features/listings/components/FeaturedProductsCarousel";
import { Button } from "@/components/ui/Button";
import { FeedPagination } from "@/components/ui/FeedPagination";
import { MARKETPLACE_PATH } from "@/lib/constants";
import { buildPathQuery } from "@/lib/url/build-path-query";

interface ExplorePageProps {
  searchParams: { page?: string; seller?: string; msg?: string };
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const page = Number(searchParams.page ?? "1");
  const sellerId = searchParams.seller?.trim() || undefined;
  const flashMessage = getCheckoutFlashMessage(searchParams.msg);
  const sellerProfile = sellerId ? await getPublicProfile(sellerId) : null;

  if (sellerId && !sellerProfile) {
    notFound();
  }

  const [feed, featured] = await Promise.all([
    listFeed({ page, pageSize: 16, sellerId }),
    sellerId ? Promise.resolve([]) : listFeatured(8),
  ]);

  const heading = sellerProfile
    ? `Publicaciones de ${sellerProfile.displayName}`
    : "Explorar publicaciones";

  const subtitle = sellerProfile
    ? `${feed.total} publicación${feed.total === 1 ? "" : "es"} de este vendedor`
    : `${feed.total} publicaciones activas`;

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      {flashMessage ? (
        <div
          className="mb-6 rounded-xl border border-brand/20 bg-brand-muted px-4 py-3 text-sm text-ink"
          role="status"
        >
          {flashMessage}
        </div>
      ) : null}

      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {sellerProfile ? (
            <Link
              href={`/profile/${sellerProfile.id}`}
              className="text-sm font-medium text-brand no-underline hover:underline"
            >
              ← Perfil de {sellerProfile.displayName}
            </Link>
          ) : (
            <p className="text-sm font-medium uppercase tracking-wide text-brand">
              Marketplace
            </p>
          )}
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
            {heading}
          </h1>
          <p className="mt-2 text-ink/70">{subtitle}</p>
        </div>
        {sellerProfile ? (
          <Button href={MARKETPLACE_PATH} variant="secondary" size="sm">
            Ver todo el marketplace
          </Button>
        ) : null}
      </div>

      {!sellerId && featured.length > 0 ? (
        <FeaturedProductsCarousel listings={featured} />
      ) : null}

      {feed.items.length === 0 ? (
        <div className="rounded-xl border border-ink/5 bg-card p-12 text-center">
          <p className="text-ink/70">
            {sellerProfile
              ? "Este vendedor no tiene publicaciones activas en este momento."
              : "Aún no hay publicaciones. Sé el primero en vender."}
          </p>
          {!sellerProfile ? (
            <Button href="/sell" className="mt-6">
              Publicar un artículo
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {feed.items.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          <FeedPagination
            page={feed.page}
            totalPages={feed.totalPages}
            buildPageHref={(nextPage) =>
              buildPathQuery(MARKETPLACE_PATH, {
                seller: sellerId,
                page: nextPage > 1 ? nextPage : undefined,
              })
            }
          />
        </>
      )}

      <p className="mt-12 text-center text-sm text-ink/50">
        ¿Buscas algo específico?{" "}
        <Link href="/" className="text-brand no-underline hover:underline">
          Volver al inicio
        </Link>
      </p>
    </section>
  );
}
