import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FeedPagination } from "@/components/ui/FeedPagination";
import { WantCard } from "@/features/wants/components/WantCard";
import { WantCategoryFilters } from "@/features/wants/components/WantCategoryFilters";
import { listWants } from "@/features/wants/list-wants";
import { getSession } from "@/features/auth/get-session";
import { parseListingCategoryParam } from "@/lib/listings/category-query";
import { WANTS_PATH } from "@/lib/constants";
import { buildPathQuery } from "@/lib/url/build-path-query";

interface WantsPageProps {
  searchParams: { page?: string; category?: string };
}

export default async function WantsPage({ searchParams }: WantsPageProps) {
  const page = Number(searchParams.page ?? "1");
  const activeCategory = parseListingCategoryParam(searchParams.category);
  const session = await getSession();

  const feed = await listWants({ page, pageSize: 16, category: activeCategory });

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-brand">
            Want list
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
            Lo que buscan los coleccionistas
          </h1>
          <p className="mt-2 text-ink/70">
            {feed.total} búsqueda{feed.total === 1 ? "" : "s"} pública
            {feed.total === 1 ? "" : "s"}
            {activeCategory ? ` en ${activeCategory}` : ""}
          </p>
        </div>
        {session ? (
          <Button href="/wants/new" size="sm">
            Publicar búsqueda
          </Button>
        ) : (
          <Button href={`/auth/login?next=${WANTS_PATH}/new`} size="sm">
            Inicia sesión para publicar
          </Button>
        )}
      </div>

      <div className="mb-6">
        <WantCategoryFilters activeCategory={activeCategory} />
      </div>

      {feed.items.length === 0 ? (
        <div className="rounded-xl border border-ink/5 bg-card p-12 text-center">
          <p className="text-ink/70">
            {activeCategory
              ? `No hay búsquedas activas en ${activeCategory}.`
              : "Aún no hay búsquedas publicadas."}
          </p>
          {session ? (
            <Button href="/wants/new" className="mt-6">
              Publicar la primera
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {feed.items.map((want) => (
              <WantCard key={want.id} want={want} />
            ))}
          </div>

          <FeedPagination
            page={feed.page}
            totalPages={feed.totalPages}
            buildPageHref={(nextPage) =>
              buildPathQuery(WANTS_PATH, {
                category: activeCategory,
                page: nextPage > 1 ? nextPage : undefined,
              })
            }
          />
        </>
      )}

      <p className="mt-12 text-center text-sm text-ink/50">
        ¿Vendes?{" "}
        <Link href="/explore" className="text-brand no-underline hover:underline">
          Explora publicaciones
        </Link>
      </p>
    </section>
  );
}
