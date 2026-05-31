import Redis from "ioredis";

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    const url = process.env.REDIS_URL ?? "redis://localhost:6379";
    redis = new Redis(url, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });
  }
  return redis;
}

export async function checkRedisHealth(): Promise<boolean> {
  try {
    const client = getRedis();
    if (client.status === "wait") {
      await client.connect();
    }
    const pong = await client.ping();
    return pong === "PONG";
  } catch {
    return false;
  }
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
