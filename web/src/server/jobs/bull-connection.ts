import IORedis from "ioredis";

let connection: IORedis | null = null;

/** Conexión dedicada para BullMQ (maxRetriesPerRequest: null). */
export function getBullConnection(): IORedis {
  if (!connection) {
    const url = process.env.REDIS_URL ?? "redis://localhost:6379";
    connection = new IORedis(url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }
  return connection;
}
