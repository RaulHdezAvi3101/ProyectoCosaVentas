import { prisma } from "@/server/db";
import { toListingDto } from "@/features/listings/to-listing-dto";
import { toSellerDto } from "@/features/listings/to-seller-dto";
import type { Listing, Seller } from "@/types/marketplace";

export type OrderStatus = "pending" | "paid" | "expired";

export interface CheckoutState {
  listing: Listing;
  seller: Seller;
  winnerId: string;
  orderStatus: OrderStatus;
  paymentDeadline: number;
  paidAt?: number;
}

export async function getCheckoutState(
  listingSlug: string,
): Promise<CheckoutState | null> {
  const reservation = await prisma.reservation.findFirst({
    where: {
      listing: { slug: listingSlug },
      releasedAt: null,
    },
    select: {
      id: true,
      userId: true,
      paymentDeadlineAt: true,
      listing: {
        select: {
          slug: true,
          title: true,
          description: true,
          priceCents: true,
          currency: true,
          category: true,
          condition: true,
          imageUrls: true,
          sellerId: true,
          status: true,
          firstToClaim: true,
          phraseHidden: true,
          quantity: true,
          seller: {
            select: {
              id: true,
              displayName: true,
              handle: true,
              avatarUrl: true,
              sellerProfile: {
                select: {
                  score: true,
                  tier: true,
                  sales: true,
                  positiveRate: true,
                  onTimeShipping: true,
                  avgShipHours: true,
                  responseRate: true,
                  memberSince: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!reservation?.listing.seller.sellerProfile) {
    return null;
  }

  const orderRow = await prisma.order.findUnique({
    where: { reservationId: reservation.id },
    select: {
      status: true,
      paidAt: true,
    },
  });
  const orderStatus: OrderStatus =
    orderRow?.status === "paid"
      ? "paid"
      : orderRow?.status === "expired"
        ? "expired"
        : "pending";

  return {
    listing: toListingDto(reservation.listing),
    seller: toSellerDto({
      id: reservation.listing.seller.id,
      displayName: reservation.listing.seller.displayName,
      handle: reservation.listing.seller.handle,
      avatarUrl: reservation.listing.seller.avatarUrl,
      sellerProfile: reservation.listing.seller.sellerProfile,
    }),
    winnerId: reservation.userId,
    orderStatus,
    paymentDeadline: reservation.paymentDeadlineAt.getTime(),
    paidAt: orderRow?.paidAt?.getTime(),
  };
}

export function isPaymentDeadlineExpired(deadlineMs: number): boolean {
  return deadlineMs <= Date.now();
}
