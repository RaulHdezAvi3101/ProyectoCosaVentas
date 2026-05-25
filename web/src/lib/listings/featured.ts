import type { Listing } from "@/types/marketplace";

const DEFAULT_FEATURED_SLUGS = [
  "live-charizard",
  "listing-prizm-live",
  "listing-pikachu-vmax",
  "listing-dunk-panda",
] as const;

function parseFeaturedSlugsFromEnv(): string[] | null {
  const raw = process.env.FEATURED_SLUGS?.trim();
  if (!raw) return null;
  const slugs = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return slugs.length > 0 ? slugs : null;
}

export const FEATURED_SLUGS: readonly string[] =
  parseFeaturedSlugsFromEnv() ?? [...DEFAULT_FEATURED_SLUGS];

export function partitionFeatured(listings: Listing[]): {
  featured: Listing[];
  catalog: Listing[];
} {
  const byId = new Map(listings.map((l) => [l.id, l]));
  const featuredSet = new Set<string>();

  const featured: Listing[] = [];
  for (const slug of FEATURED_SLUGS) {
    const listing = byId.get(slug);
    if (listing) {
      featured.push(listing);
      featuredSet.add(slug);
    }
  }

  if (featured.length === 0) {
    const live = listings.filter((l) => l.status === "live");
    const fallback = live.length > 0 ? live : listings;
    const take = Math.min(3, fallback.length);
    for (let i = 0; i < take; i++) {
      featured.push(fallback[i]);
      featuredSet.add(fallback[i].id);
    }
  }

  const catalog = listings.filter((l) => !featuredSet.has(l.id));
  return { featured, catalog };
}
