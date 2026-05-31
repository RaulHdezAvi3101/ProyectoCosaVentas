export class MediaError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "MediaError";
    this.status = status;
    this.code = code;
  }
}

export const MEDIA_ERROR_MESSAGES = {
  unauthorized: "Inicia sesión para subir fotos.",
  missingFile: "Falta el archivo de imagen.",
  invalidType: "Solo se aceptan imágenes JPEG.",
  tooLarge: "La imagen supera 800 KB.",
  staleExif:
    "La foto no es reciente (máx. 10 min). Tómala de nuevo con la cámara.",
  missingExif:
    "La imagen no incluye metadatos de captura. Usa la cámara en tiempo real.",
  uploadFailed: "No se pudo guardar la imagen. Intenta de nuevo.",
} as const;
