import { getPaymentWindowMs } from "@/server/claim/constants";
import { prisma } from "@/server/db";
import {
  getPaymentExpiredQueue,
  type PaymentExpiredJobData,
} from "./queues";

export async function schedulePaymentExpiredJob(
  data: PaymentExpiredJobData
): Promise<void> {
  await cancelPaymentExpiredJob(data.reservationId);

  const queue = getPaymentExpiredQueue();
  const delay = getPaymentWindowMs();

  await queue.add("expire", data, {
    jobId: data.reservationId,
    delay,
  });

  await prisma.reservation.update({
    where: { id: data.reservationId },
    data: { bullJobId: data.reservationId },
  });
}

export async function cancelPaymentExpiredJob(
  reservationId: string
): Promise<void> {
  const queue = getPaymentExpiredQueue();
  try {
    const job = await queue.getJob(reservationId);
    if (job) await job.remove();
  } catch {
    /* job ya procesado o inexistente */
  }
}
