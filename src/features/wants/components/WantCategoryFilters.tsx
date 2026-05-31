import {
  CategoryFilterLink,
  CategoryFilterNav,
} from "@/components/filters/CategoryFilterNav";
import { LISTING_CATEGORIES } from "@/lib/camera/constants";
import { WANTS_PATH } from "@/lib/constants";
import { buildPathQuery } from "@/lib/url/build-path-query";

interface WantCategoryFiltersProps {
  activeCategory?: string;
}

export function WantCategoryFilters({ activeCategory }: WantCategoryFiltersProps) {
  return (
    <CategoryFilterNav ariaLabel="Filtrar búsquedas por categoría">
      <CategoryFilterLink
        href={buildPathQuery(WANTS_PATH, {})}
        active={!activeCategory}
      >
        Todas
      </CategoryFilterLink>
      {LISTING_CATEGORIES.map((category) => (
        <CategoryFilterLink
          key={category}
          href={buildPathQuery(WANTS_PATH, { category })}
          active={activeCategory === category}
        >
          {category}
        </CategoryFilterLink>
      ))}
    </CategoryFilterNav>
  );
}
