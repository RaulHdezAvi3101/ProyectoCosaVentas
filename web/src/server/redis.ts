import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
  redisAvailable: boolean | null;
};

function createClient(): Redis {
  const url = process.env.REDIS_URL ?? "redis://localhost:6379";
  return new Redis(url, {
    maxRetriesPerRequest: 2,
    lazyConnect: true,
  });
}

export const redis =
  globalForRedis.redis ??
  createClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

export async function isRedisAvailable(): Promise<boolean> {
  if (process.env.USE_MEMORY_STORE === "1") return false;
  if (!process.env.REDIS_URL && process.env.NODE_ENV === "production") {
    return false;
  }
  if (globalForRedis.redisAvailable != null) {
    return globalForRedis.redisAvailable;
  }

  try {
    if (redis.status !== "ready") {
      await redis.connect();
    }
    const pong = await redis.ping();
    globalForRedis.redisAvailable = pong === "PONG";
  } catch {
    globalForRedis.redisAvailable = false;
  }

  return globalForRedis.redisAvailable;
}
