"use client";

import { useMemo } from "react";
import type { CapturedPhoto } from "@/lib/camera/types";

export interface RetakePhotoMeta {
  isRetakeMode: boolean;
  retakeIndex: number;
  retakePhoto?: CapturedPhoto;
  retakeLabel: string;
}

export function useRetakePhotoMeta(
  photos: CapturedPhoto[],
  retakePhotoId: string | null,
): RetakePhotoMeta {
  return useMemo(() => {
    if (!retakePhotoId) {
      return {
        isRetakeMode: false,
        retakeIndex: -1,
        retakePhoto: undefined,
        retakeLabel: "esta foto",
      };
    }

    const retakeIndex = photos.findIndex((photo) => photo.id === retakePhotoId);
    const retakePhoto = retakeIndex >= 0 ? photos[retakeIndex] : undefined;
    const retakeLabel =
      retakeIndex === 0
        ? "portada"
        : retakeIndex > 0
          ? `foto ${retakeIndex + 1}`
          : "esta foto";

    return {
      isRetakeMode: true,
      retakeIndex,
      retakePhoto,
      retakeLabel,
    };
  }, [photos, retakePhotoId]);
}
