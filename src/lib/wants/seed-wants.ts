export interface SeedWantEntry {
  slug: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  desiredCondition: string;
  targetPriceCents: number;
  currency: string;
}

export const SEED_WANT_CATALOG: SeedWantEntry[] = [
  {
    slug: "want-charizard-vmax",
    userId: "cmpqdrch600087u6dfbmvjxkx",
    title: "Charizard VMAX Rainbow — mint o mejor",
    description:
      "Busco la rainbow de Espada y Escudo en estado mint o PSA 9+. Preferencia carta en español pero acepto inglés.",
    category: "Pokémon",
    desiredCondition: "Como nuevo",
    targetPriceCents: 3_200_000,
    currency: "MXN",
  },
  {
    slug: "want-lego-millennium",
    userId: "cmpqdrch600087u6dfbmvjxkx",
    title: "LEGO Star Wars UCS Millennium Falcon (75192)",
    description:
      "Set completo con caja y manual. Puede estar abierto pero todas las piezas intactas y sin piezas repuestas.",
    category: "LEGO",
    desiredCondition: "Usado — excelente",
    targetPriceCents: 18_500_000,
    currency: "MXN",
  },
  {
    slug: "want-hot-wheels-super",
    userId: "seller-3",
    title: "Hot Wheels Super Treasure Hunt 2024",
    description:
      "Cualquier STH de la línea 2024 en blister. Busco para regalo, estado sellado preferido.",
    category: "Hot Wheels",
    desiredCondition: "Nuevo",
    targetPriceCents: 450_000,
    currency: "MXN",
  },
];
