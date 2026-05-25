import type { ListingStatus } from "@/types/marketplace";

/** URLs verificadas (HTTP 200 en images.unsplash.com). */
export const SEED_IMAGES = {
  cardsA:
    "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=800&fit=crop",
  cardsB:
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop",
  sneakers:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop",
  collectible:
    "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=800&h=800&fit=crop",
  tech:
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop",
  watch:
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
  headphones:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
  package:
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop",
} as const;

export type SeedListingDef = {
  slug: string;
  sellerId: "seller-1" | "seller-2" | "seller-3" | "seller-4";
  title: string;
  description: string;
  priceCents: number;
  category: string;
  condition: string;
  imageUrls: readonly string[];
  status: ListingStatus;
  firstToClaim: boolean;
  phraseHidden: boolean;
  /** Clave en SEED_CLAIM_PHRASES; null si no aplica FTC */
  phraseKey: string | null;
  viewers?: number;
};

export const SEED_LISTING_DEFS: readonly SeedListingDef[] = [
  {
    slug: "live-charizard",
    sellerId: "seller-1",
    title: "Charizard Holo 1st Edition — PSA 9",
    description:
      "Carta icónica en excelente estado. Incluye case PSA original. Venta First to Claim: envía la frase por mensaje.",
    priceCents: 1_850_000,
    category: "Pokémon",
    condition: "Graded PSA 9",
    imageUrls: [SEED_IMAGES.cardsA, SEED_IMAGES.cardsB],
    status: "live",
    firstToClaim: true,
    phraseHidden: false,
    phraseKey: "live-charizard",
    viewers: 47,
  },
  {
    slug: "listing-2",
    sellerId: "seller-2",
    title: "Jordan 1 Retro High OG — Chicago",
    description: "Talla 9 US. Caja original. Usado 2 veces.",
    priceCents: 890_000,
    category: "Sneakers",
    condition: "Como nuevo",
    imageUrls: [SEED_IMAGES.sneakers],
    status: "active",
    firstToClaim: false,
    phraseHidden: false,
    phraseKey: null,
  },
  {
    slug: "listing-3",
    sellerId: "seller-2",
    title: "Mewtwo GX Full Art — Mint",
    description: "Sin rayones. Sleeve desde día uno.",
    priceCents: 120_000,
    category: "Pokémon",
    condition: "Mint",
    imageUrls: [SEED_IMAGES.collectible],
    status: "active",
    firstToClaim: true,
    phraseHidden: true,
    phraseKey: "listing-3",
    viewers: 12,
  },
  {
    slug: "listing-locked",
    sellerId: "seller-1",
    title: "Booster Box Evolving Skies (sellado)",
    description: "Caja sellada de fábrica. Ya reclamado en demo.",
    priceCents: 420_000,
    category: "Pokémon",
    condition: "Sellado",
    imageUrls: [SEED_IMAGES.package],
    status: "locked",
    firstToClaim: true,
    phraseHidden: false,
    phraseKey: "listing-locked",
    viewers: 0,
  },
  {
    slug: "listing-pikachu-vmax",
    sellerId: "seller-1",
    title: "Pikachu VMAX Rainbow — CGC 10",
    description: "Rainbow rare de Espada y Escudo. Certificado CGC 10 reciente.",
    priceCents: 3_450_000,
    category: "Pokémon",
    condition: "Graded CGC 10",
    imageUrls: [SEED_IMAGES.cardsB],
    status: "active",
    firstToClaim: false,
    phraseHidden: false,
    phraseKey: null,
  },
  {
    slug: "listing-dunk-panda",
    sellerId: "seller-2",
    title: "Nike Dunk Low Retro — Panda",
    description: "Talla 10 US. Deadstock con etiquetas. Sin probador.",
    priceCents: 2_100_000,
    category: "Sneakers",
    condition: "Nuevo con etiquetas",
    imageUrls: [SEED_IMAGES.sneakers],
    status: "active",
    firstToClaim: false,
    phraseHidden: false,
    phraseKey: null,
  },
  {
    slug: "listing-prizm-live",
    sellerId: "seller-1",
    title: "Caja NBA Prizm 2024 — Hobby (sellada)",
    description: "Caja hobby sellada. Drop First to Claim en vivo.",
    priceCents: 5_800_000,
    category: "Deportes",
    condition: "Sellado",
    imageUrls: [SEED_IMAGES.package, SEED_IMAGES.cardsA],
    status: "live",
    firstToClaim: true,
    phraseHidden: false,
    phraseKey: "listing-prizm-live",
    viewers: 31,
  },
  {
    slug: "listing-funko-chase",
    sellerId: "seller-2",
    title: "Funko Pop! Chase — Batman (metálico)",
    description: "Edición chase en caja mint. Frase oculta hasta reclamar.",
    priceCents: 85_000,
    category: "Funko",
    condition: "Mint en caja",
    imageUrls: [SEED_IMAGES.collectible],
    status: "active",
    firstToClaim: true,
    phraseHidden: true,
    phraseKey: "listing-funko-chase",
    viewers: 8,
  },
  {
    slug: "listing-vintage-comic",
    sellerId: "seller-1",
    title: "Amazing Spider-Man #300 — NM",
    description: "Primera aparición de Venom. Encapsulado, sin restauración.",
    priceCents: 12_500_000,
    category: "Cómics",
    condition: "Near Mint",
    imageUrls: [SEED_IMAGES.cardsA],
    status: "active",
    firstToClaim: false,
    phraseHidden: false,
    phraseKey: null,
  },
  {
    slug: "listing-airpods-max",
    sellerId: "seller-2",
    title: "AirPods Max — Space Gray",
    description: "Poco uso, estuche y cable Lightning incluidos.",
    priceCents: 720_000,
    category: "Audio",
    condition: "Excelente",
    imageUrls: [SEED_IMAGES.headphones],
    status: "active",
    firstToClaim: false,
    phraseHidden: false,
    phraseKey: null,
  },
  {
    slug: "listing-rolex-style",
    sellerId: "seller-1",
    title: "Reloj automático vintage — estilo Submariner",
    description: "Movimiento automático, cristal zafiro, correa acero.",
    priceCents: 4_500_000,
    category: "Relojes",
    condition: "Muy bueno",
    imageUrls: [SEED_IMAGES.watch],
    status: "active",
    firstToClaim: true,
    phraseHidden: false,
    phraseKey: "listing-rolex-style",
    viewers: 19,
  },
  {
    slug: "listing-sofia-nuevo",
    sellerId: "seller-3",
    title: "Lámina Gengar VMAX — primera publicación",
    description:
      "Mi primer anuncio en la plataforma. Carta en sleeve desde compra, sin jugar.",
    priceCents: 95_000,
    category: "Pokémon",
    condition: "Near Mint",
    imageUrls: [SEED_IMAGES.cardsB],
    status: "active",
    firstToClaim: false,
    phraseHidden: false,
    phraseKey: null,
  },
  {
    slug: "listing-raul-baja-rep",
    sellerId: "seller-4",
    title: "iPhone 13 Pro — 256 GB (sin factura)",
    description:
      "Funciona bien, batería ~84%. Sin caja original. Precio agresivo por liquidación.",
    priceCents: 580_000,
    category: "Tecnología",
    condition: "Usado",
    imageUrls: [SEED_IMAGES.tech],
    status: "active",
    firstToClaim: false,
    phraseHidden: false,
    phraseKey: null,
  },
] as const;
