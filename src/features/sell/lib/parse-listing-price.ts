export function parseListingPriceMxn(price: string): number | null {
  const priceNumber = Number.parseFloat(price.replace(",", "."));
  if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
    return null;
  }
  return priceNumber;
}
