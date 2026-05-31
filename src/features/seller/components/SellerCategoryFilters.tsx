import {
  CategoryFilterLink,
  CategoryFilterNav,
} from "@/components/filters/CategoryFilterNav";
import { LISTING_CATEGORIES } from "@/lib/camera/constants";
import { buildPathQuery } from "@/lib/url/build-path-query";

interface SellerCategoryFiltersProps {
  sellerId: string;
  activeCategory?: string;
  counts: Array<{ category: string; count: number }>;
}

export function SellerCategoryFilters({
  sellerId,
  activeCategory,
  counts,
}: SellerCategoryFiltersProps) {
  const total = counts.reduce((sum, entry) => sum + entry.count, 0);
  const countByCategory = new Map(counts.map((c) => [c.category, c.count]));
  const profilePath = `/profile/${sellerId}`;

  return (
    <CategoryFilterNav ariaLabel="Filtrar por categoría">
      <CategoryFilterLink
        href={buildPathQuery(profilePath, {})}
        active={!activeCategory}
      >
        Todas ({total})
      </CategoryFilterLink>
      {LISTING_CATEGORIES.map((category) => {
        const count = countByCategory.get(category) ?? 0;

        if (count === 0) {
          return null;
        }

        return (
          <CategoryFilterLink
            key={category}
            href={buildPathQuery(profilePath, { category })}
            active={activeCategory === category}
          >
            {category} ({count})
          </CategoryFilterLink>
        );
      })}
    </CategoryFilterNav>
  );
}
