import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/server/db";
import { checkRedisHealth } from "@/server/redis";
import type { HealthResponse } from "@/types/marketplace";

export async function GET() {
  const [dbUp, redisUp] = await Promise.all([
    checkDatabaseHealth(),
    checkRedisHealth(),
  ]);

  const body: HealthResponse = {
    ok: dbUp && redisUp,
    db: dbUp ? "up" : "down",
    redis: redisUp ? "up" : "down",
  };

  return NextResponse.json(body, { status: body.ok ? 200 : 503 });
}
