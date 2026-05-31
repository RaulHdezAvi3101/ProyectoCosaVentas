"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MAX_PHOTOS } from "@/lib/camera/constants";
import { revokePhotoPreview } from "@/lib/camera/capture";
import type { CapturedPhoto } from "@/lib/camera/types";

interface CaptureSessionContextValue {
  photos: CapturedPhoto[];
  addPhoto: (photo: CapturedPhoto) => void;
  removePhoto: (photoId: string) => void;
  replacePhoto: (photoId: string, photo: CapturedPhoto) => void;
  reorderPhotos: (fromIndex: number, toIndex: number) => void;
  clearPhotos: () => void;
  canAddMore: boolean;
  retakePhotoId: string | null;
  startRetake: (photoId: string) => void;
  clearRetake: () => void;
}

const CaptureSessionContext = createContext<CaptureSessionContextValue | null>(
  null,
);

export function CaptureSessionProvider({ children }: { children: ReactNode }) {
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [retakePhotoId, setRetakePhotoId] = useState<string | null>(null);

  const clearRetake = useCallback(() => {
    setRetakePhotoId(null);
  }, []);

  const startRetake = useCallback((photoId: string) => {
    setRetakePhotoId(photoId);
  }, []);

  const clearPhotos = useCallback(() => {
    setPhotos((current) => {
      current.forEach(revokePhotoPreview);
      return [];
    });
  }, []);

  const addPhoto = useCallback((photo: CapturedPhoto) => {
    setPhotos((current) => {
      if (current.length >= MAX_PHOTOS) {
        revokePhotoPreview(photo);
        return current;
      }
      return [...current, photo];
    });
  }, []);

  const removePhoto = useCallback((photoId: string) => {
    setPhotos((current) => {
      const target = current.find((photo) => photo.id === photoId);
      if (target) {
        revokePhotoPreview(target);
      }
      return current.filter((photo) => photo.id !== photoId);
    });
    setRetakePhotoId((current) => (current === photoId ? null : current));
  }, []);

  const replacePhoto = useCallback((photoId: string, photo: CapturedPhoto) => {
    setPhotos((current) =>
      current.map((existing) => {
        if (existing.id !== photoId) {
          return existing;
        }
        revokePhotoPreview(existing);
        return photo;
      }),
    );
  }, []);

  const reorderPhotos = useCallback((fromIndex: number, toIndex: number) => {
    setPhotos((current) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= current.length ||
        toIndex >= current.length
      ) {
        return current;
      }

      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      photos,
      addPhoto,
      removePhoto,
      replacePhoto,
      reorderPhotos,
      clearPhotos,
      canAddMore: photos.length < MAX_PHOTOS,
      retakePhotoId,
      startRetake,
      clearRetake,
    }),
    [
      photos,
      addPhoto,
      removePhoto,
      replacePhoto,
      reorderPhotos,
      clearPhotos,
      retakePhotoId,
      startRetake,
      clearRetake,
    ],
  );

  return (
    <CaptureSessionContext.Provider value={value}>
      {children}
    </CaptureSessionContext.Provider>
  );
}

export function useCaptureSession(): CaptureSessionContextValue {
  const context = useContext(CaptureSessionContext);

  if (!context) {
    throw new Error("useCaptureSession debe usarse dentro de CaptureSessionProvider.");
  }

  return context;
}
