import Image from "next/image";
import type { CapturedPhoto } from "@/lib/camera/types";

interface RetakePreviewBannerProps {
  photo: CapturedPhoto;
  photoIndex: number;
}

export function RetakePreviewBanner({ photo, photoIndex }: RetakePreviewBannerProps) {
  return (
    <div className="mb-4 flex items-center gap-4 rounded-xl border border-ink/10 bg-surface/60 p-3">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface">
        <Image
          src={photo.previewUrl}
          alt={`Foto actual ${photoIndex + 1}`}
          fill
          unoptimized
          className="object-cover opacity-70"
        />
      </div>
      <div className="min-w-0 text-sm">
        <p className="font-medium text-ink">Foto actual</p>
        <p className="text-ink/60">
          Se reemplazará al capturar una nueva imagen en vivo.
        </p>
      </div>
    </div>
  );
}
