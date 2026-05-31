import { cn } from "@/lib/cn";

interface OverlayProps {
  title: string;
  description?: string;
  className?: string;
}

const overlayBase =
  "rounded-xl border p-5 shadow-soft";

export function LiveOverlay({ title, description, className }: OverlayProps) {
  return (
    <div
      className={cn(
        overlayBase,
        "border-brand/20 bg-brand-muted text-ink",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-brand">
        En vivo
      </p>
      <h3 className="mt-1 font-display text-lg font-semibold">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm text-ink/70">{description}</p>
      ) : null}
    </div>
  );
}

export function LockedOverlay({ title, description, className }: OverlayProps) {
  return (
    <div
      className={cn(
        overlayBase,
        "border-accent/30 bg-accent/10 text-ink",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">
        Reservado
      </p>
      <h3 className="mt-1 font-display text-lg font-semibold">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm text-ink/70">{description}</p>
      ) : null}
    </div>
  );
}

export function ReleasedOverlay({
  title,
  description,
  className,
}: OverlayProps) {
  return (
    <div
      className={cn(
        overlayBase,
        "border-brand/15 bg-brand/10 text-ink",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-brand">
        Liberado
      </p>
      <h3 className="mt-1 font-display text-lg font-semibold">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm text-ink/70">{description}</p>
      ) : null}
    </div>
  );
}

export function SoldOverlay({ title, description, className }: OverlayProps) {
  return (
    <div
      className={cn(
        overlayBase,
        "border-ink/10 bg-ink/5 text-ink/80",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">
        Vendido
      </p>
      <h3 className="mt-1 font-display text-lg font-semibold text-ink">
        {title}
      </h3>
      {description ? (
        <p className="mt-2 text-sm text-ink/60">{description}</p>
      ) : null}
    </div>
  );
}
