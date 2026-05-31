import { randomUUID } from "crypto";
import { markOrderPaid } from "@/server/payment/mark-order-paid";
import {
  InvalidIdempotencyKeyError,
  NotWinnerError,
  PaymentError,
} from "@/server/payment/errors";
import {
  getCheckoutState,
  isPaymentDeadlineExpired,
} from "@/server/payment/get-checkout-state";

export interface PayOrderInput {
  listingSlug: string;
  userId: string;
  idempotencyKey?: string;
}

export interface PayOrderResult {
  listingSlug: string;
  paidAt: number;
  alreadyPaid: boolean;
}

const IDEMPOTENCY_KEY_PATTERN = /^[a-zA-Z0-9_-]{8,128}$/;

export function normalizeIdempotencyKey(key: string | undefined): string {
  const trimmed = key?.trim();

  if (!trimmed) {
    return randomUUID();
  }

  if (!IDEMPOTENCY_KEY_PATTERN.test(trimmed)) {
    throw new InvalidIdempotencyKeyError();
  }

  return trimmed;
}

export async function payOrder(input: PayOrderInput): Promise<PayOrderResult> {
  const idempotencyKey = normalizeIdempotencyKey(input.idempotencyKey);

  const checkout = await getCheckoutState(input.listingSlug);

  if (!checkout) {
    throw new PaymentError("No hay checkout disponible para esta publicación.", 404);
  }

  if (checkout.winnerId !== input.userId) {
    throw new NotWinnerError();
  }

  if (
    checkout.orderStatus === "pending" &&
    isPaymentDeadlineExpired(checkout.paymentDeadline)
  ) {
    throw new PaymentError("El plazo de pago expiró.", 410);
  }

  await simulateGatewayCharge();

  return markOrderPaid({
    listingSlug: input.listingSlug,
    winnerId: input.userId,
    idempotencyKey,
  });
}

/** Simulated gateway — always succeeds in MVP (Fase 6: real Conekta/Stripe). */
export async function simulateGatewayCharge(): Promise<{ ok: true }> {
  return { ok: true };
}
