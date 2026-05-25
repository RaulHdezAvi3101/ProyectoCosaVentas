import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { initClaimStore } from "./src/server/claim";
import { startPaymentExpiredWorker } from "./src/server/jobs/payment-expired.worker";
import { parseSessionTokenFromCookieHeader } from "./src/lib/auth/parse-cookie";
import { resolveSessionFromToken } from "./src/lib/auth/session-resolve";
import { attachSocketHandlers } from "./src/server/socket-handlers";
import "./src/types/socket-data";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "./src/types/socket";

const PLATFORM_LABEL = "CosaVentas";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME ?? "localhost";
const port = parseInt(process.env.PORT ?? "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  await initClaimStore();

  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(
    httpServer,
    {
      path: "/socket.io",
      cors: { origin: dev ? "*" : false },
    }
  );

  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.request.headers.cookie;
      const token = parseSessionTokenFromCookieHeader(cookieHeader);
      if (token) {
        const session = await resolveSessionFromToken(token);
        if (session) {
          socket.data.userId = session.id;
          socket.data.displayName = session.displayName;
        }
      }
      next();
    } catch (err) {
      console.error("[socket] session handshake", err);
      next();
    }
  });

  attachSocketHandlers(io);
  startPaymentExpiredWorker(io);

  httpServer.listen(port, () => {
    console.log(
      `> ${PLATFORM_LABEL} ready on http://${hostname}:${port} (${dev ? "dev" : "production"})`
    );
  });
});
