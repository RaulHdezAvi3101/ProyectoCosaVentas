import { MAX_PHOTOS, MIN_PHOTOS } from "@/lib/camera/constants";

export function getCaptureDescription(
  isRetakeMode: boolean,
  isMobile: boolean,
): string {
  if (isRetakeMode) {
    return "La nueva captura sustituirá solo esta imagen. El resto de tu galería no cambia.";
  }

  const range = `Necesitas entre ${MIN_PHOTOS} y ${MAX_PHOTOS} fotos. La primera será la portada.`;

  return isMobile
    ? `Usa la cámara de tu teléfono. ${range}`
    : `Usa la webcam de tu PC o una cámara USB. ${range}`;
}

export function getViewfinderHint(isMobile: boolean): string {
  return isMobile
    ? "Fondo neutro = más ventas"
    : "Apunta al producto — fondo neutro = más ventas";
}
