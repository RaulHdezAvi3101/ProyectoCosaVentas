import {
  formatOnTimeShipping,
  getScoreTier,
  LOW_POSITIVE_RATE_THRESHOLD,
} from "@/lib/reputation";
import type { Seller } from "@/types/marketplace";

export type SellerAlertKind = "new" | "low_reputation";

export interface SellerAlertInfo {
  kind: SellerAlertKind;
  title: string;
  message: string;
  hint: string;
}

const NEW_SELLER_MAX_SALES = 0;

export function isNewSeller(seller: Seller): boolean {
  return seller.tier === "nuevo" && seller.sales <= NEW_SELLER_MAX_SALES;
}

export function isLowReputationSeller(seller: Seller): boolean {
  if (isNewSeller(seller)) return false;
  return (
    seller.tier === "low" ||
    getScoreTier(seller.score) === "low" ||
    seller.positiveRate < LOW_POSITIVE_RATE_THRESHOLD
  );
}

export function getSellerAlert(seller: Seller): SellerAlertInfo | null {
  if (isNewSeller(seller)) {
    return {
      kind: "new",
      title: "Vendedor nuevo en la plataforma",
      message: `${seller.name} aún no tiene ventas completadas ni historial de envíos verificado.`,
      hint: "Revisa fotos, descripción y condiciones antes de reclamar o pagar. Considera mensajes con el vendedor para aclarar dudas.",
    };
  }

  if (isLowReputationSeller(seller)) {
    const shipping = formatOnTimeShipping(seller);
    return {
      kind: "low_reputation",
      title: "Reputación baja",
      message: `${seller.name} tiene un score de ${seller.score} pts, ${seller.positiveRate}% de valoraciones positivas y ${shipping.toLowerCase()}.`,
      hint: "Hay mayor riesgo de retrasos o disputas. Valora si el precio compensa ese riesgo y guarda evidencia del anuncio.",
    };
  }

  return null;
}
