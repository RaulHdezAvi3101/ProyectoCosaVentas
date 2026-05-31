import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getSession } from "@/features/auth/get-session";
import { MakeWantOfferForm } from "@/features/wants/components/MakeWantOfferForm";
import { WantOffersList } from "@/features/wants/components/WantOffersList";
import { getWantBySlug } from "@/features/wants/list-wants";
import { listSellerListingsForOffer } from "@/features/wants/create-want-offer";
import { formatPriceMxn } from "@/lib/listings/format-price";
import { WANTS_PATH } from "@/lib/constants";

interface WantDetailPageProps {
  params: { slug: string };
}

export default async function WantDetailPage({ params }: WantDetailPageProps) {
  const detail = await getWantBySlug(params.slug);

  if (!detail) {
    notFound();
  }

  const session = await getSession();
  const { want, offers } = detail;
  const isOwner = session?.user.id === want.authorId;
  const wantActive = want.status === "active";
  const existingOffer = session
    ? offers.find((offer) => offer.sellerId === session.user.id)
    : undefined;
  const canOffer =
    Boolean(session) &&
    !isOwner &&
    wantActive &&
    (!existingOffer || existingOffer.status === "pending");

  const sellerListings =
    canOffer && session
      ? await listSellerListingsForOffer(session.user.id)
      : [];

  const initial = want.author?.name.charAt(0).toUpperCase() ?? "?";

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href={WANTS_PATH}
        className="text-sm font-medium text-brand no-underline hover:underline"
      >
        ← Want list
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          {want.title}
        </h1>
        <Badge variant="neutral">Busco</Badge>
        <Badge variant="neutral">{want.category}</Badge>
        {want.status === "fulfilled" ? (
          <Badge variant="live">Completada</Badge>
        ) : null}
      </div>

      <Card className="mt-6">
        <p className="text-ink/80">{want.description}</p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-ink/60">Precio objetivo</dt>
            <dd className="text-xl font-semibold tabular-nums text-brand">
              {formatPriceMxn(want.targetPrice, want.currency)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-ink/60">Estado deseado</dt>
            <dd className="font-medium text-ink">{want.desiredCondition}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink/60">Ofertas recibidas</dt>
            <dd className="font-medium text-ink">{offers.length}</dd>
          </div>
        </dl>

        {want.author ? (
          <div className="mt-6 flex items-center gap-3 border-t border-ink/5 pt-6">
            {want.author.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={want.author.avatarUrl}
                alt=""
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-lg font-semibold text-brand">
                {initial}
              </div>
            )}
            <div>
              <p className="text-sm text-ink/60">Publicado por</p>
              <Link
                href={`/profile/${want.author.id}`}
                className="font-medium text-ink no-underline hover:text-brand"
              >
                {want.author.name}
              </Link>
              <p className="text-sm text-ink/60">{want.author.handle}</p>
            </div>
          </div>
        ) : null}
      </Card>

      <div className="mt-10">
        <h2 className="mb-4 font-display text-xl font-semibold text-ink">
          {isOwner ? "Ofertas recibidas" : "Ofertas de vendedores"}
        </h2>

        {canOffer ? (
          <div className="mb-6">
            <MakeWantOfferForm
              wantSlug={want.id}
              targetPrice={want.targetPrice}
              listings={sellerListings}
              existingOffer={existingOffer}
            />
          </div>
        ) : !session && !isOwner ? (
          <Card className="mb-6">
            <p className="text-sm text-ink/70">
              <Link
                href={`/auth/login?next=/wants/${want.id}`}
                className="text-brand no-underline hover:underline"
              >
                Inicia sesión
              </Link>{" "}
              para hacer una oferta directa al comprador.
            </p>
          </Card>
        ) : existingOffer && !canOffer ? (
          <Card className="mb-6">
            <p className="text-sm font-medium text-ink">Tu oferta</p>
            <p className="mt-1 text-sm text-ink/70">{existingOffer.message}</p>
            <p className="mt-2 text-sm">
              Estado:{" "}
              <strong className="capitalize">{existingOffer.status}</strong>
            </p>
          </Card>
        ) : null}

        {isOwner ? (
          <WantOffersList
            wantSlug={want.id}
            offers={offers}
            isOwner
            wantActive={wantActive}
          />
        ) : canOffer ? (
          <p className="text-sm text-ink/60">
            Las ofertas de otros vendedores son privadas para quien publicó la
            búsqueda.
          </p>
        ) : null}

        {!wantActive && isOwner ? (
          <Card className="mt-4">
            <p className="text-sm text-ink/70">
              Esta búsqueda ya fue completada. No se aceptan nuevas ofertas.
            </p>
          </Card>
        ) : null}
      </div>
    </section>
  );
}
