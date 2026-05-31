"use client";

import Image from "next/image";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { CapturedPhoto } from "@/lib/camera/types";

interface PhotoGalleryGridProps {
  photos: CapturedPhoto[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: (photoId: string) => void;
  onRetake: (photoId: string) => void;
}

export function PhotoGalleryGrid({
  photos,
  onReorder,
  onRemove,
  onRetake,
}: PhotoGalleryGridProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragEnd() {
    if (dragIndex !== null && dropIndex !== null && dragIndex !== dropIndex) {
      onReorder(dragIndex, dropIndex);
    }
    setDragIndex(null);
    setDropIndex(null);
  }

  function handleDragOver(event: React.DragEvent, index: number) {
    event.preventDefault();
    setDropIndex(index);
  }

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
      {photos.map((photo, index) => (
        <Card
          key={photo.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragEnd={handleDragEnd}
          onDragOver={(event) => handleDragOver(event, index)}
          className={cn(
            "relative overflow-hidden p-3 transition",
            dragIndex === index && "scale-[0.98] opacity-60",
            dropIndex === index &&
              dragIndex !== null &&
              dragIndex !== index &&
              "ring-2 ring-brand ring-offset-2",
          )}
        >
          <div className="relative aspect-square overflow-hidden rounded-lg bg-surface">
            <Image
              src={photo.previewUrl}
              alt={`Foto ${index + 1}`}
              fill
              unoptimized
              className="pointer-events-none object-cover"
            />
            {index === 0 ? (
              <span className="absolute left-2 top-2 rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                Portada
              </span>
            ) : null}
            <span className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-xs font-medium text-white">
              {index + 1}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span
              className="cursor-grab text-xs font-medium text-ink/50 active:cursor-grabbing"
              aria-hidden
            >
              ⋮⋮ Arrastrar
            </span>
            {index > 0 ? (
              <button
                type="button"
                className="text-xs font-medium text-brand hover:underline"
                onClick={() => onReorder(index, index - 1)}
              >
                ← Izquierda
              </button>
            ) : null}
            {index < photos.length - 1 ? (
              <button
                type="button"
                className="text-xs font-medium text-brand hover:underline"
                onClick={() => onReorder(index, index + 1)}
              >
                Derecha →
              </button>
            ) : null}
            <button
              type="button"
              className="text-xs font-medium text-brand hover:underline"
              onClick={() => onRetake(photo.id)}
            >
              Retomar
            </button>
            <button
              type="button"
              className="text-xs font-medium text-destructive hover:underline"
              onClick={() => onRemove(photo.id)}
            >
              Eliminar
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}
