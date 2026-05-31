import { Queue, Worker } from "bullmq";
import type { ConnectionOptions } from "bullmq";
import { releaseReservationById } from "@/server/claim/release-reservation";

const QUEUE_NAME = "payment-expired";

export interface PaymentExpiredJobData {
  reservationId: string;
  listingSlug: string;
}

let paymentExpiredQueue: Queue<PaymentExpiredJobData> | null = null;
let paymentExpiredWorker: Worker<PaymentExpiredJobData> | null = null;

function getBullConnection(): ConnectionOptions {
  const url = new URL(process.env.REDIS_URL ?? "redis://localhost:6379");
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    maxRetriesPerRequest: null,
  };
}

export function getPaymentExpiredQueue(): Queue<PaymentExpiredJobData> {
  if (!paymentExpiredQueue) {
    paymentExpiredQueue = new Queue<PaymentExpiredJobData>(QUEUE_NAME, {
      connection: getBullConnection(),
    });
  }
  return paymentExpiredQueue;
}

export function startPaymentExpiredWorker(): Worker<PaymentExpiredJobData> {
  if (paymentExpiredWorker) {
    return paymentExpiredWorker;
  }

  paymentExpiredWorker = new Worker<PaymentExpiredJobData>(
    QUEUE_NAME,
    async (job) => {
      await releaseReservationById(job.data.reservationId);
    },
    { connection: getBullConnection() },
  );

  paymentExpiredWorker.on("failed", (job, error) => {
    console.error("[bullmq] payment-expired failed", job?.id, error);
  });

  return paymentExpiredWorker;
}

export async function closeQueueResources(): Promise<void> {
  if (paymentExpiredWorker) {
    await paymentExpiredWorker.close();
    paymentExpiredWorker = null;
  }
  if (paymentExpiredQueue) {
    await paymentExpiredQueue.close();
    paymentExpiredQueue = null;
  }
}
