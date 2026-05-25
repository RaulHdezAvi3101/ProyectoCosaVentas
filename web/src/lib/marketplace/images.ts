import { SEED_IMAGES } from "@/lib/listings/seed-catalog";

const DEFAULT_IMAGE = SEED_IMAGES.cardsA;

export function primaryImageUrl(imageUrls: string[]): string {
  const url = imageUrls.find((u) => u.trim().length > 0);
  return url ?? DEFAULT_IMAGE;
}
