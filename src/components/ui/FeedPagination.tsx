import { Button } from "@/components/ui/Button";

interface FeedPaginationProps {
  page: number;
  totalPages: number;
  buildPageHref: (page: number) => string;
}

export function FeedPagination({
  page,
  totalPages,
  buildPageHref,
}: FeedPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-3"
      aria-label="Paginación"
    >
      {page > 1 ? (
        <Button href={buildPageHref(page - 1)} variant="secondary" size="sm">
          Anterior
        </Button>
      ) : null}
      <span className="text-sm text-ink/60">
        Página {page} de {totalPages}
      </span>
      {page < totalPages ? (
        <Button href={buildPageHref(page + 1)} variant="secondary" size="sm">
          Siguiente
        </Button>
      ) : null}
    </nav>
  );
}
