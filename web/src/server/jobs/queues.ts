import { Queue } from "bullmq";
import { getBullConnection } from "./bull-connection";

export const PAYMENT_EXPIRED_QUEUE = "payment-expired";

export interface PaymentExpiredJobData {
  reservationId: string;
  listingSlug: string;
}

let queue: Queue<PaymentExpiredJobData> | null = null;

export function getPaymentExpiredQueue(): Queue<PaymentExpiredJobData> {
  if (!queue) {
    queue = new Queue<PaymentExpiredJobData>(PAYMENT_EXPIRED_QUEUE, {
      connection: getBullConnection(),
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: 50,
      },
    });
  }
  return queue;
}
