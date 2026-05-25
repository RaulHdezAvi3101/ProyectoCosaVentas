import { Worker } from "bullmq";
import type { Server } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/types/socket";
import { getBullConnection } from "./bull-connection";
import { PAYMENT_EXPIRED_QUEUE, type PaymentExpiredJobData } from "./queues";
import { releaseListingIfUnpaid } from "./release-listing";
import { setSocketIo } from "@/server/socket-io";

let worker: Worker<PaymentExpiredJobData> | null = null;

export function startPaymentExpiredWorker(
  io: Server<ClientToServerEvents, ServerToClientEvents>
): Worker<PaymentExpiredJobData> {
  if (worker) return worker;

  setSocketIo(io);

  worker = new Worker<PaymentExpiredJobData>(
    PAYMENT_EXPIRED_QUEUE,
    async (job) => {
      await releaseListingIfUnpaid(job.data.reservationId);
    },
    { connection: getBullConnection() }
  );

  worker.on("failed", (job, err) => {
    console.error(`[jobs] payment-expired failed ${job?.id}`, err);
  });

  console.log("[jobs] payment-expired worker started");
  return worker;
}

export async function stopPaymentExpiredWorker(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
  }
}
