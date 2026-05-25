import type { Seller, SellerTier } from "@/types/marketplace";

export type ScoreTier = "low" | "mid" | "good" | "elite";

/** Por debajo de este % de valoraciones positivas se considera reputación baja. */
export const LOW_POSITIVE_RATE_THRESHOLD = 85;

export function getScoreTier(score: number): ScoreTier {
  if (score >= 901) return "elite";
  if (score >= 601) return "good";
  if (score >= 301) return "mid";
  return "low";
}

export function getScoreStyles(score: number): {
  bg: string;
  text: string;
  ring: string;
} {
  const tier = getScoreTier(score);
  switch (tier) {
    case "elite":
      return {
        bg: "bg-accent-light",
        text: "text-accent-dark",
        ring: "ring-accent",
      };
    case "good":
      return { bg: "bg-teal-light", text: "text-teal-dark", ring: "ring-teal" };
    case "mid":
      return { bg: "bg-amber-light", text: "text-amber-dark", ring: "ring-amber" };
    default:
      return { bg: "bg-coral-light", text: "text-coral-dark", ring: "ring-coral" };
  }
}

export function getTierLabel(tier: SellerTier): string {
  const labels: Record<SellerTier, string> = {
    nuevo: "Nuevo",
    low: "Bajo",
    verificado: "Verificado",
    trusted: "Trusted",
    elite: "Elite",
  };
  return labels[tier];
}

export function formatSellerActivitySummary(seller: Seller): string {
  if (seller.sales === 0) {
    return "Sin ventas completadas";
  }
  return `${seller.sales.toLocaleString("es-MX")} ventas · ${seller.positiveRate}% positivas`;
}

export function formatOnTimeShipping(seller: Seller): string {
  if (seller.sales === 0) {
    return "Sin historial de envíos";
  }
  return `${seller.onTimeShipping}% envíos a tiempo`;
}
