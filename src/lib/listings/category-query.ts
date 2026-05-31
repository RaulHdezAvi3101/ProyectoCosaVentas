import { LISTING_CATEGORIES } from "@/lib/camera/constants";

export type ListingCategory = (typeof LISTING_CATEGORIES)[number];

export function parseListingCategoryParam(
  value: string | undefined,
): ListingCategory | undefined {
  if (!value) {
    return undefined;
  }

  return (LISTING_CATEGORIES as readonly string[]).includes(value)
    ? (value as ListingCategory)
    : undefined;
}
