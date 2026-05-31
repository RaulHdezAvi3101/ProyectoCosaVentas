export function formatPriceMxn(priceCents: number, currency = "MXN"): string {
  const pesos = priceCents / 100;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    maximumFractionDigits: pesos >= 1000 ? 0 : 2,
  }).format(pesos);
}
