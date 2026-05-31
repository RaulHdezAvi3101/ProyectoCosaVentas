export type CheckoutOrderStatus = "pending" | "paid" | "expired";

export interface CheckoutApiResponse {
  listing: import("@/types/marketplace").Listing;
  seller: import("@/types/marketplace").Seller;
  orderStatus: CheckoutOrderStatus;
  paymentDeadline: number;
  paidAt?: number;
}
