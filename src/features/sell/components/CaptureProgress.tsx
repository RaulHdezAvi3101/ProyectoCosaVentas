"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import { MAX_PHOTOS, MIN_PHOTOS } from "@/lib/camera/constants";
import type { CapturedPhoto } from "@/lib/camera/types";

interface CaptureProgressProps {
  photos: CapturedPhoto[];
  className?: string;
}

export function CaptureProgress({ photos, className }: CaptureProgressProps) {
  const count = photos.length;
  const ready = count >= MIN_PHOTOS;
  const progress = Math.min(100, (count / MIN_PHOTOS) * 100);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-ink/80">
          Fotos capturadas: {count}/{MAX_PHOTOS}
        </span>
        <span
          className={cn(
            "font-medium",
            ready ? "text-brand" : "text-ink/60",
          )}
        >
          {ready
            ? "Listo para continuar"
            : `Mínimo ${MIN_PHOTOS} para publicar`}
        </span>
      </div>

      <div
        className="h-2 overflow-hidden rounded-full bg-ink/10"
        role="progressbar"
        aria-valuenow={count}
        aria-valuemin={0}
        aria-valuemax={MIN_PHOTOS}
        aria-label={`Progreso de captura: ${count} de ${MIN_PHOTOS} fotos mínimas`}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            ready ? "bg-brand" : "bg-accent",
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {photos.length > 0 ? (
        <ul
          className="flex gap-2 overflow-x-auto pb-1"
          aria-label="Miniaturas capturadas"
        >
          {photos.map((photo, index) => (
            <li key={photo.id} className="shrink-0">
              <div
                className={cn(
                  "relative h-14 w-14 overflow-hidden rounded-lg border-2 bg-surface",
                  index === 0 ? "border-accent" : "border-transparent",
                )}
              >
                <Image
                  src={photo.previewUrl}
                  alt={`Miniatura ${index + 1}`}
                  fill
                  unoptimized
                  className="object-cover"
                />
                {index === 0 ? (
                  <span className="absolute inset-x-0 bottom-0 bg-accent/90 py-0.5 text-center text-[9px] font-semibold text-accent-foreground">
                    Portada
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
