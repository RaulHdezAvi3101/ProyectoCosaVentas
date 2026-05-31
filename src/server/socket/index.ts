import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/types/socket";
import { processClaimAttempt } from "@/server/claim/claim-service";
import {
  buildListingStateSnapshot,
  listingRoomName,
} from "@/server/claim/listing-state";
import { resolveClaimIdentity } from "@/server/claim/resolve-claim-identity";
import {
  decrementViewers,
  incrementViewers,
} from "@/server/claim/redis-runtime";
import { setIo } from "@/server/socket/io-instance";

interface SocketData {
  identity?: Awaited<ReturnType<typeof resolveClaimIdentity>>;
  joinedListingSlug?: string;
}

async function getSocketIdentity(
  socket: import("socket.io").Socket,
): Promise<Awaited<ReturnType<typeof resolveClaimIdentity>>> {
  const socketData = socket.data as SocketData;
  if (socketData.identity !== undefined) {
    return socketData.identity;
  }

  const identity = await resolveClaimIdentity({
    cookieHeader: socket.handshake.headers.cookie,
    auth: socket.handshake.auth as {
      guestId?: string;
      displayName?: string;
    },
  });
  socketData.identity = identity;
  return identity;
}

export function attachSocketServer(httpServer: HttpServer): Server {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    path: "/socket.io",
    cors: {
      origin: process.env.NODE_ENV === "production" ? false : "*",
    },
  });

  setIo(io);

  io.on("connection", (socket) => {
    void getSocketIdentity(socket);

    socket.on("listing:join", async (payload) => {
      try {
        const listingSlug = payload.listingId.trim();
        if (!listingSlug) {
          return;
        }

        const room = listingRoomName(listingSlug);
        await socket.join(room);

        const socketData = socket.data as SocketData;
        if (socketData.joinedListingSlug === listingSlug) {
          const snapshot = await buildListingStateSnapshot(listingSlug);
          if (snapshot) {
            socket.emit("listing:state", snapshot);
          }
          return;
        }

        if (socketData.joinedListingSlug) {
          const previousSlug = socketData.joinedListingSlug;
          await socket.leave(listingRoomName(previousSlug));
          await decrementViewers(previousSlug);
          const previousSnapshot = await buildListingStateSnapshot(previousSlug);
          if (previousSnapshot) {
            io.to(listingRoomName(previousSlug)).emit(
              "listing:state",
              previousSnapshot,
            );
          }
        }

        socketData.joinedListingSlug = listingSlug;
        await incrementViewers(listingSlug);

        const snapshot = await buildListingStateSnapshot(listingSlug);
        if (snapshot) {
          io.to(room).emit("listing:state", snapshot);
        }
      } catch (error) {
        console.error("[socket] listing:join failed", error);
      }
    });

    socket.on("claim:attempt", async (payload) => {
      try {
        const listingSlug = payload.listingId.trim();
        const phrase = payload.phrase;
        const claimIdentity = await getSocketIdentity(socket);

        if (!listingSlug || !phrase.trim()) {
          socket.emit("claim:result", { outcome: "invalid" });
          return;
        }

        if (!claimIdentity) {
          socket.emit("claim:result", { outcome: "invalid" });
          return;
        }

        const outcome = await processClaimAttempt({
          listingSlug,
          phrase,
          userId: claimIdentity.userId,
          displayName: claimIdentity.displayName,
        });

        socket.emit("claim:result", outcome.result);

        if (outcome.kind !== "won") {
          return;
        }

        const room = listingRoomName(listingSlug);
        io.to(room).emit("listing:locked", outcome.lockedPayload);

        const snapshot = await buildListingStateSnapshot(listingSlug);
        if (snapshot) {
          io.to(room).emit("listing:state", snapshot);
        }
      } catch (error) {
        console.error("[socket] claim:attempt failed", error);
        socket.emit("claim:result", { outcome: "invalid" });
      }
    });

    socket.on("disconnect", async () => {
      try {
        const socketData = socket.data as SocketData;
        if (!socketData.joinedListingSlug) {
          return;
        }

        const slug = socketData.joinedListingSlug;
        await socket.leave(listingRoomName(slug));
        await decrementViewers(slug);
        const snapshot = await buildListingStateSnapshot(slug);
        if (snapshot) {
          io.to(listingRoomName(slug)).emit("listing:state", snapshot);
        }
      } catch (error) {
        console.error("[socket] disconnect cleanup failed", error);
      }
    });
  });

  return io;
}
