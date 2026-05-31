import type { ListingStatus } from "@prisma/client";

export interface SeedListingEntry {
  slug: string;
  sellerId: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  category: string;
  condition: string;
  imageUrls: string[];
  status: ListingStatus;
  firstToClaim: boolean;
  phraseHidden: boolean;
  quantity: number;
}

export const SEED_DEMO_USERS = [
  {
    id: "seller-1",
    email: "maria@local.dev",
    displayName: "María Colecciones",
    handle: "@maria_colecciones",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    sellerProfile: {
      score: 942,
      tier: "elite",
      sales: 1247,
      positiveRate: 99,
      onTimeShipping: 97,
      avgShipHours: 18,
      responseRate: 98,
      memberSince: "2022",
    },
  },
  {
    id: "seller-2",
    email: "luis@local.dev",
    displayName: "Luis TCG",
    handle: "@luis_tcg",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    sellerProfile: {
      score: 680,
      tier: "trusted",
      sales: 312,
      positiveRate: 97,
      onTimeShipping: 91,
      avgShipHours: 24,
      responseRate: 92,
      memberSince: "2023",
    },
  },
  {
    id: "seller-3",
    email: "sofia@local.dev",
    displayName: "Sofía Primeras Ventas",
    handle: "@sofia_primeras",
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    sellerProfile: {
      score: 0,
      tier: "nuevo",
      sales: 0,
      positiveRate: 0,
      onTimeShipping: 0,
      avgShipHours: 48,
      responseRate: 0,
      memberSince: "2026",
    },
  },
  {
    id: "seller-4",
    email: "raul@local.dev",
    displayName: "Raúl Outlet Riesgoso",
    handle: "@raul_outlet",
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
    sellerProfile: {
      score: 142,
      tier: "low",
      sales: 28,
      positiveRate: 68,
      onTimeShipping: 61,
      avgShipHours: 72,
      responseRate: 45,
      memberSince: "2024",
    },
  },
  {
    id: "cmpqdrch600087u6dfbmvjxkx",
    email: "comprador@local.dev",
    displayName: "Comprador demo",
    handle: "@comprador_demo",
    avatarUrl: "",
    sellerProfile: {
      score: 0,
      tier: "nuevo",
      sales: 0,
      positiveRate: 0,
      onTimeShipping: 0,
      avgShipHours: 48,
      responseRate: 0,
      memberSince: "2026",
    },
  },
] as const;

export const SEED_LISTING_CATALOG: SeedListingEntry[] = [
  {
    slug: "live-charizard",
    sellerId: "seller-1",
    title: "Charizard Holo 1st Edition — PSA 9",
    description:
      "Carta icónica en excelente estado. Incluye case PSA original. Venta First to Claim: envía la frase por mensaje.",
    priceCents: 1_850_000,
    currency: "MXN",
    category: "Pokémon",
    condition: "Graded PSA 9",
    imageUrls: [
      "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop",
    ],
    status: "live",
    firstToClaim: true,
    phraseHidden: false,
    quantity: 1,
  },
  {
    slug: "listing-2",
    sellerId: "seller-2",
    title: "Hot Wheels RLC — '55 Chevy Bel Air Gasser",
    description: "Red Line Club en blister. Card mint, nunca abierto.",
    priceCents: 890_000,
    currency: "MXN",
    category: "Hot Wheels",
    condition: "Como nuevo",
    imageUrls: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop",
    ],
    status: "active",
    firstToClaim: false,
    phraseHidden: true,
    quantity: 1,
  },
  {
    slug: "listing-3",
    sellerId: "seller-2",
    title: "Mewtwo GX Full Art — Mint",
    description: "Sin rayones. Sleeve desde día uno.",
    priceCents: 120_000,
    currency: "MXN",
    category: "Pokémon",
    condition: "Mint",
    imageUrls: [
      "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=800&h=800&fit=crop",
    ],
    status: "active",
    firstToClaim: true,
    phraseHidden: true,
    quantity: 1,
  },
  {
    slug: "listing-locked",
    sellerId: "seller-1",
    title: "Booster Box Evolving Skies (sellado)",
    description: "Caja sellada de fábrica. Demo First to Claim.",
    priceCents: 420_000,
    currency: "MXN",
    category: "Pokémon",
    condition: "Sellado",
    imageUrls: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop",
    ],
    status: "locked",
    firstToClaim: true,
    phraseHidden: false,
    quantity: 1,
  },
  {
    slug: "listing-pikachu-vmax",
    sellerId: "seller-1",
    title: "Pikachu VMAX Rainbow — CGC 10",
    description:
      "Rainbow rare de Espada y Escudo. Certificado CGC 10 reciente.",
    priceCents: 3_450_000,
    currency: "MXN",
    category: "Pokémon",
    condition: "Graded CGC 10",
    imageUrls: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop",
    ],
    status: "active",
    firstToClaim: false,
    phraseHidden: true,
    quantity: 1,
  },
  {
    slug: "listing-dunk-panda",
    sellerId: "seller-2",
    title: "Nike Dunk Low Retro — Panda",
    description: "Talla 10 US. Deadstock con etiquetas. Sin probador.",
    priceCents: 2_100_000,
    currency: "MXN",
    category: "Otros",
    condition: "Nuevo con etiquetas",
    imageUrls: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop",
    ],
    status: "active",
    firstToClaim: false,
    phraseHidden: true,
    quantity: 1,
  },
  {
    slug: "listing-prizm-live",
    sellerId: "seller-1",
    title: "Caja NBA Prizm 2024 — Hobby (sellada)",
    description: "Caja hobby sellada. Drop First to Claim en vivo.",
    priceCents: 5_800_000,
    currency: "MXN",
    category: "Otros",
    condition: "Sellado",
    imageUrls: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=800&fit=crop",
    ],
    status: "live",
    firstToClaim: true,
    phraseHidden: false,
    quantity: 1,
  },
  {
    slug: "listing-funko-chase",
    sellerId: "seller-2",
    title: "Funko Pop! Chase — Batman (metálico)",
    description: "Edición chase en caja mint. Frase oculta hasta reclamar.",
    priceCents: 85_000,
    currency: "MXN",
    category: "Funko",
    condition: "Mint en caja",
    imageUrls: [
      "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=800&h=800&fit=crop",
    ],
    status: "active",
    firstToClaim: true,
    phraseHidden: true,
    quantity: 1,
  },
  {
    slug: "listing-vintage-comic",
    sellerId: "seller-1",
    title: "LEGO Creator Expert — Taj Mahal (10256)",
    description:
      "Set sellado de fábrica. Caja en excelente estado, sin aplastamientos.",
    priceCents: 12_500_000,
    currency: "MXN",
    category: "LEGO",
    condition: "Near Mint",
    imageUrls: [
      "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=800&fit=crop",
    ],
    status: "active",
    firstToClaim: false,
    phraseHidden: true,
    quantity: 1,
  },
  {
    slug: "listing-airpods-max",
    sellerId: "seller-2",
    title: "AirPods Max — Space Gray",
    description: "Poco uso, estuche y cable Lightning incluidos.",
    priceCents: 720_000,
    currency: "MXN",
    category: "Otros",
    condition: "Excelente",
    imageUrls: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
    ],
    status: "active",
    firstToClaim: false,
    phraseHidden: true,
    quantity: 1,
  },
  {
    slug: "listing-rolex-style",
    sellerId: "seller-1",
    title: "Reloj automático vintage — estilo Submariner",
    description: "Movimiento automático, cristal zafiro, correa acero.",
    priceCents: 4_500_000,
    currency: "MXN",
    category: "Otros",
    condition: "Muy bueno",
    imageUrls: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
    ],
    status: "active",
    firstToClaim: true,
    phraseHidden: false,
    quantity: 1,
  },
  {
    slug: "listing-sofia-nuevo",
    sellerId: "seller-3",
    title: "Lámina Gengar VMAX — primera publicación",
    description:
      "Mi primer anuncio en la plataforma. Carta en sleeve desde compra, sin jugar.",
    priceCents: 95_000,
    currency: "MXN",
    category: "Pokémon",
    condition: "Near Mint",
    imageUrls: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop",
    ],
    status: "active",
    firstToClaim: false,
    phraseHidden: true,
    quantity: 1,
  },
  {
    slug: "listing-raul-baja-rep",
    sellerId: "seller-4",
    title: "iPhone 13 Pro — 256 GB (sin factura)",
    description:
      "Funciona bien, batería ~84%. Sin caja original. Precio agresivo por liquidación.",
    priceCents: 580_000,
    currency: "MXN",
    category: "Otros",
    condition: "Usado",
    imageUrls: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop",
    ],
    status: "active",
    firstToClaim: false,
    phraseHidden: true,
    quantity: 1,
  },
];

export interface SeedBundleEntry {
  slug: string;
  sellerId: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  pickCount: number | null;
  listingSlugs: string[];
}

export const SEED_BUNDLE_CATALOG: SeedBundleEntry[] = [
  {
    slug: "bundle-pokemon-pick-2-of-4",
    sellerId: "seller-1",
    title: "Lote Pokémon — elige 2 de 4",
    description:
      "Selecciona dos cartas del lote a precio especial. Ideal para completar tu colección.",
    priceCents: 2_800_000,
    currency: "MXN",
    pickCount: 2,
    listingSlugs: [
      "live-charizard",
      "listing-pikachu-vmax",
      "listing-prizm-live",
      "listing-rolex-style",
    ],
  },
  {
    slug: "bundle-funko-duo",
    sellerId: "seller-2",
    title: "Pack Funko + accesorios",
    description: "Lote fijo: Pop chase y accesorios audio a precio de bundle.",
    priceCents: 750_000,
    currency: "MXN",
    pickCount: null,
    listingSlugs: ["listing-funko-chase", "listing-airpods-max"],
  },
];
