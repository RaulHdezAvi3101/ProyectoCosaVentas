import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { getPublicProfile } from "@/features/auth/get-public-profile";
import { getSession } from "@/features/auth/get-session";
import { listFeed } from "@/features/listings/list-feed";
import { ListingCard } from "@/features/listings/components/ListingCard";
import { listSellerBundles } from "@/features/bundles/get-bundle";
import { BundleCard } from "@/features/bundles/components/BundleCard";
import { FollowSellerButton } from "@/features/seller/components/FollowSellerButton";
import { SellerCategoryFilters } from "@/features/seller/components/SellerCategoryFilters";
import { SellerStatsCard } from "@/features/seller/components/SellerStatsCard";
import {
  countSellerFollowers,
  isFollowingSeller,
} from "@/features/seller/follow-seller";
import { getSellerCategoryCounts } from "@/features/seller/seller-catalog";
import { parseListingCategoryParam } from "@/lib/listings/category-query";
import { Button } from "@/components/ui/Button";

interface ProfilePageProps {
  params: { id: string };
  searchParams: { category?: string };
}

export default async function ProfilePage({
  params,
  searchParams,
}: ProfilePageProps) {
  const profile = await getPublicProfile(params.id);

  if (!profile) {
    notFound();
  }

  const session = await getSession();
  const isOwnProfile = session?.user.id === profile.id;
  const activeCategory = parseListingCategoryParam(searchParams.category);

  const [catalog, categoryCounts, bundles, followerCount, following] =
    await Promise.all([
      listFeed({
        sellerId: profile.id,
        category: activeCategory,
        pageSize: 24,
      }),
      getSellerCategoryCounts(profile.id),
      listSellerBundles(profile.id),
      countSellerFollowers(profile.id),
      session && !isOwnProfile
        ? isFollowingSeller(session.user.id, profile.id)
        : Promise.resolve(false),
    ]);

  const initial = profile.displayName.charAt(0).toUpperCase();

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt=""
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-xl font-semibold text-brand">
              {initial}
            </div>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-semibold text-ink">
                {profile.displayName}
              </h1>
              <Badge variant="neutral" className="capitalize">
                {profile.sellerProfile.tier}
              </Badge>
              {isOwnProfile ? (
                <Badge variant="neutral">Tu perfil</Badge>
              ) : null}
            </div>
            <p className="text-ink/70">{profile.handle}</p>
            <p className="mt-1 text-sm text-ink/60">
              {profile.sellerProfile.score} pts ·{" "}
              {profile.sellerProfile.positiveRate}% reseñas positivas
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          {isOwnProfile ? (
            <>
              <Button href="/sell" size="sm">
                Publicar artículo
              </Button>
              <Button href="/seller/bundles/new" variant="secondary" size="sm">
                Crear bundle
              </Button>
            </>
          ) : session ? (
            <FollowSellerButton
              sellerId={profile.id}
              initialFollowing={following}
            />
          ) : (
            <Button href={`/auth/login?next=/profile/${profile.id}`} size="sm">
              Inicia sesión para seguir
            </Button>
          )}
        </div>
      </div>

      <div className="mb-10 grid gap-6 lg:grid-cols-2">
        <SellerStatsCard profile={profile} followerCount={followerCount} />

        <div className="rounded-xl border border-ink/5 bg-card p-6">
          <h2 className="mb-2 font-display text-lg font-semibold text-ink">
            Reseñas
          </h2>
          <p className="text-sm text-ink/70">
            Las reseñas con foto del producto recibido llegarán en la Fase 6.
            Mientras tanto, consulta el puntaje y las estadísticas del vendedor.
          </p>
        </div>
      </div>

      {bundles.length > 0 ? (
        <div className="mb-10">
          <h2 className="mb-4 font-display text-xl font-semibold text-ink">
            Bundles y lotes
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {bundles.map((bundle) => (
              <BundleCard key={bundle.id} bundle={bundle} />
            ))}
          </div>
        </div>
      ) : null}

      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-xl font-semibold text-ink">
          Stock disponible
          {activeCategory ? ` · ${activeCategory}` : ""}
        </h2>
        <p className="text-sm text-ink/60">
          {catalog.total} publicación{catalog.total === 1 ? "" : "es"}
        </p>
      </div>

      {categoryCounts.length > 0 ? (
        <div className="mb-6">
          <SellerCategoryFilters
            sellerId={profile.id}
            activeCategory={activeCategory}
            counts={categoryCounts}
          />
        </div>
      ) : null}

      {catalog.items.length === 0 ? (
        <div className="rounded-xl border border-ink/5 bg-card p-12 text-center">
          <p className="text-ink/70">
            {activeCategory
              ? `No hay publicaciones en ${activeCategory} en este momento.`
              : "Este vendedor no tiene publicaciones activas."}
          </p>
          {activeCategory ? (
            <Link
              href={`/profile/${profile.id}`}
              className="mt-4 inline-block text-sm font-medium text-brand no-underline hover:underline"
            >
              Ver todo el stock
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {catalog.items.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </section>
  );
}
