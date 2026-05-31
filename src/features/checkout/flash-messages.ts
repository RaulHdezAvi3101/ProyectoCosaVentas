const CHECKOUT_FLASH_MESSAGES: Record<string, string> = {
  "checkout-unavailable":
    "No hay reserva activa para pagar en esa publicación.",
  "not-winner": "Solo el ganador de Primero en reclamar puede acceder al pago.",
  "payment-expired": "El plazo de pago expiró. La publicación volverá a estar disponible.",
};

export function getCheckoutFlashMessage(key: string | undefined): string | null {
  if (!key) {
    return null;
  }

  return CHECKOUT_FLASH_MESSAGES[key] ?? null;
}
