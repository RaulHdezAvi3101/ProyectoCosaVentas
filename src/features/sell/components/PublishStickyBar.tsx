import { Button } from "@/components/ui/Button";

interface PublishStickyBarProps {
  stickySummary: string;
  priceLabel: string | null;
  uploadProgress?: string;
  loading: boolean;
  onAddMorePhotos: () => void;
}

export function PublishStickyBar({
  stickySummary,
  priceLabel,
  uploadProgress,
  loading,
  onAddMorePhotos,
}: PublishStickyBarProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-card/95 px-4 py-3 shadow-[0_-8px_24px_rgba(17,17,17,0.08)] backdrop-blur-sm sm:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      role="region"
      aria-label="Publicar publicación"
    >
      {uploadProgress ? (
        <p className="mb-2 text-center text-xs text-ink/60" role="status">
          {uploadProgress}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{stickySummary}</p>
          <p className="text-lg font-semibold tabular-nums text-brand">
            {priceLabel ?? "Agrega un precio"}
          </p>
        </div>
        <Button
          type="submit"
          form="publish-listing-form"
          disabled={loading}
          className="min-h-12 shrink-0 px-6"
        >
          {loading ? "Publicando…" : "Publicar"}
        </Button>
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={onAddMorePhotos}
        className="mt-2 w-full py-1 text-center text-sm font-medium text-brand disabled:opacity-50"
      >
        Agregar más fotos
      </button>
    </div>
  );
}
