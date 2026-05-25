import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { ListingCard } from "@/components/listing/ListingCard";
import { partitionFeatured } from "@/lib/listings/featured";
import { getListings, getSellersByIds } from "@/lib/listings/queries";
import { PLATFORM_NAME } from "@/lib/marketplace/constants";

export default async function HomePage() {
  const listings = await getListings();
  const { featured, catalog } = partitionFeatured(listings);
  const sellerIds = Array.from(new Set(listings.map((l) => l.sellerId)));
  const sellersById = await getSellersByIds(sellerIds);

  return (
    <main className="mx-auto max-w-lg px-4 pt-4 lg:max-w-7xl lg:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink">{PLATFORM_NAME}</h1>
        <p className="text-sm text-muted">Coleccionables · First to Claim</p>
      </header>

      {featured.length > 0 && (
        <>
          <h2 className="mb-3 text-sm font-semibold text-muted">Destacados</h2>
          <FeaturedCarousel listings={featured} />
        </>
      )}

      <h2 className="mb-3 text-sm font-semibold text-muted">Publicaciones</h2>
      {catalog.length === 0 ? (
        <p className="rounded-xl border border-dashed border-black/15 bg-white/60 px-4 py-8 text-center text-sm text-muted">
          No hay publicaciones en el catálogo. Ejecuta{" "}
          <code className="text-xs text-ink">npm run db:seed</code> o publica desde{" "}
          <a href="/sell" className="font-medium text-accent-dark underline">
            Vender
          </a>
          .
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {catalog.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              seller={sellersById.get(listing.sellerId)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
