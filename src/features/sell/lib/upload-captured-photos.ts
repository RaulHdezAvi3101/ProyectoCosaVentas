import type { CapturedPhoto } from "@/lib/camera/types";

interface UploadJsonResponse {
  url?: string;
  error?: string;
}

export async function uploadCapturedPhotos(
  photos: CapturedPhoto[],
  onProgress?: (message: string) => void,
): Promise<string[]> {
  const urls: string[] = [];

  for (let index = 0; index < photos.length; index += 1) {
    const photo = photos[index];
    onProgress?.(`Subiendo foto ${index + 1} de ${photos.length}…`);

    const formData = new FormData();
    formData.append("file", photo.blob, `capture-${index + 1}.jpg`);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as UploadJsonResponse;

    if (!response.ok) {
      throw new Error(data.error ?? "No se pudo subir una foto.");
    }

    if (!data.url) {
      throw new Error("Respuesta de upload inválida.");
    }

    urls.push(data.url);
  }

  return urls;
}
