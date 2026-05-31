import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getPublicProfile } from "@/features/auth/get-public-profile";
import { BundlePriceCompare } from "@/features/bundles/components/BundlePriceCompare";
import { getBundleBySlug } from "@/features/bundles/get-bundle";
import { formatPriceMxn } from "@/lib/listings/format-price";

interface BundlePageProps {
  params: { slug: string };
}

export default async function BundlePage({ params }: BundlePageProps) {
  const bundle = await getBundleBySlug(params.slug);

  if (!bundle) {
    notFound();
  }

  const seller = await getPublicProfile(bundle.sellerId);
  const isPickLot = bundle.pickCount !== null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href={seller ? `/profile/${seller.id}` : "/explore"}
        className="text-sm font-medium text-brand no-underline hover:underline"
      >
        ← {seller ? `Perfil de ${seller.displayName}` : "Explorar"}
      </Link>

      <div className="mt-4 flex flex-wrap items-start gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          {bundle.title}
        </h1>
        <Badge variant="live">Bundle</Badge>
        {isPickLot ? (
          <Badge variant="neutral">
            Elige {bundle.pickCount} de {bundle.totalCount}
          </Badge>
        ) : null}
      </div>

      <p className="mt-3 max-w-3xl text-ink/70">{bundle.description}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <BundlePriceCompare bundle={bundle} />

        {seller ? (
          <Card>
            <h2 className="mb-2 font-display text-lg font-semibold text-ink">
              Vendedor
            </h2>
            <Link
              href={`/profile/${seller.id}`}
              className="font-medium text-brand no-underline hover:underline"
            >
              {seller.displayName}
            </Link>
            <p className="mt-1 text-sm text-ink/60">{seller.handle}</p>
          </Card>
        ) : null}
      </div>

      <div className="mt-10">
        <h2 className="mb-4 font-display text-xl font-semibold text-ink">
          Artículos incluidos
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bundle.items.map((item) => (
            <Card key={item.id} className="overflow-hidden p-0">
              <Link href={`/listings/${item.id}`} className="block no-underline">
                {item.imageUrls[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrls[0]}
                    alt=""
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="aspect-square bg-surface" />
                )}
                <div className="p-4">
                  <p className="line-clamp-2 text-sm font-medium text-ink">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-ink/60">{item.category}</p>
                  <p className="mt-2 text-sm font-semibold tabular-nums text-ink">
                    {formatPriceMxn(item.price)}
                  </p>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
