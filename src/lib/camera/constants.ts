export const MIN_PHOTOS = 2;
export const MAX_PHOTOS = 6;
export const MAX_UPLOAD_BYTES = 800 * 1024;
export const MIN_CAPTURE_DIMENSION = 1080;
export const EXIF_MAX_AGE_MS = 10 * 60 * 1000;

export const LISTING_CATEGORIES = [
  "LEGO",
  "Hot Wheels",
  "Funko",
  "Pokémon",
  "Otros",
] as const;

export const LISTING_CONDITIONS = [
  "Nuevo",
  "Como nuevo",
  "Usado — excelente",
  "Usado — buen estado",
] as const;
