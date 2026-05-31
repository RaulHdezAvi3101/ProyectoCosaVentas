import { createServer } from "node:http";
import next from "next";
import { attachSocketServer } from "./src/server/socket";
import { startPaymentExpiredWorker, closeQueueResources } from "./src/server/queue";
import { closeRedis } from "./src/server/redis";
import { prisma } from "./src/server/db";
import { reconcileRedisFromPostgres } from "./src/server/claim/reconcile-redis";

const port = Number(process.env.PORT ?? 3000);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

async function shutdown(): Promise<void> {
  console.log("[server] shutting down...");
  await closeQueueResources();
  await closeRedis();
  await prisma.$disconnect();
  process.exit(0);
}

app.prepare().then(async () => {
  const restored = await reconcileRedisFromPostgres();
  if (restored > 0) {
    console.log(`[server] reconciled ${restored} Redis winner key(s) from Postgres`);
  }

  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  attachSocketServer(httpServer);
  startPaymentExpiredWorker();

  httpServer.listen(port, () => {
    console.log(`[server] ready on http://localhost:${port}`);
  });

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
});
