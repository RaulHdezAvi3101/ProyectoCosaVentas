import { injectCaptureExif } from "@/lib/camera/inject-exif";
import {
  MAX_UPLOAD_BYTES,
  MIN_CAPTURE_DIMENSION,
} from "@/lib/camera/constants";
import type { CapturedPhoto } from "@/lib/camera/types";

function createPhotoId(): string {
  return `photo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("No se pudo generar la imagen."));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}

function computeCaptureSize(
  sourceWidth: number,
  sourceHeight: number,
): { width: number; height: number } {
  const minSide = Math.min(sourceWidth, sourceHeight);

  if (minSide >= MIN_CAPTURE_DIMENSION) {
    return { width: sourceWidth, height: sourceHeight };
  }

  const scale = MIN_CAPTURE_DIMENSION / minSide;
  return {
    width: Math.round(sourceWidth * scale),
    height: Math.round(sourceHeight * scale),
  };
}

async function compressCanvas(
  canvas: HTMLCanvasElement,
): Promise<{ blob: Blob; width: number; height: number }> {
  let quality = 0.92;
  let blob = await canvasToBlob(canvas, quality);

  while (blob.size > MAX_UPLOAD_BYTES && quality > 0.35) {
    quality -= 0.07;
    blob = await canvasToBlob(canvas, quality);
  }

  if (blob.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      "La foto supera 800 KB incluso con compresión. Intenta con mejor luz o menos detalle.",
    );
  }

  return { blob, width: canvas.width, height: canvas.height };
}

export async function capturePhotoFromVideo(
  video: HTMLVideoElement,
): Promise<CapturedPhoto> {
  if (video.videoWidth === 0 || video.videoHeight === 0) {
    throw new Error("La cámara aún no está lista. Espera un momento.");
  }

  const { width, height } = computeCaptureSize(
    video.videoWidth,
    video.videoHeight,
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("No se pudo preparar el lienzo de captura.");
  }

  context.drawImage(video, 0, 0, width, height);

  const capturedAt = new Date();
  const { blob: rawBlob, width: finalWidth, height: finalHeight } =
    await compressCanvas(canvas);
  const blob = await injectCaptureExif(rawBlob, capturedAt);
  const previewUrl = URL.createObjectURL(blob);

  return {
    id: createPhotoId(),
    previewUrl,
    blob,
    capturedAt: capturedAt.getTime(),
    width: finalWidth,
    height: finalHeight,
  };
}

export function revokePhotoPreview(photo: CapturedPhoto): void {
  URL.revokeObjectURL(photo.previewUrl);
}
