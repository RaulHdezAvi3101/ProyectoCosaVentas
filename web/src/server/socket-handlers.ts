import type { Server, Socket } from "socket.io";
import { getClaimStore } from "@/server/claim";
import { listingRoomId } from "@/server/socket-io";
import type {
  ClaimAttemptPayload,
  ClientToServerEvents,
  ListingJoinPayload,
  ServerToClientEvents,
} from "@/types/socket";
import "../types/socket-data";

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

const socketRooms = new Map<string, string>();

function allowGuestClaim(): boolean {
  return process.env.ALLOW_GUEST_CLAIM !== "false";
}

async function emitState(io: Server, listingId: string) {
  const store = await getClaimStore();
  const state = await store.getState(listingId);
  if (!state) return;
  io.to(listingRoomId(listingId)).emit("listing:state", state);
}

export function attachSocketHandlers(io: Server) {
  io.on("connection", (socket: AppSocket) => {
    socket.on("listing:join", async (payload: ListingJoinPayload) => {
      const { listingId } = payload;
      if (!listingId) return;

      const store = await getClaimStore();
      const prev = socketRooms.get(socket.id);

      if (prev === listingId) {
        const current = await store.getState(listingId);
        if (current) socket.emit("listing:state", current);
        return;
      }

      if (prev) {
        await store.leaveRoom(prev);
        socket.leave(listingRoomId(prev));
      }

      const state = await store.joinRoom(listingId);
      if (!state) return;

      socketRooms.set(socket.id, listingId);
      socket.join(listingRoomId(listingId));
      socket.emit("listing:state", state);
      socket.to(listingRoomId(listingId)).emit("listing:state", state);
    });

    socket.on("claim:attempt", async (payload: ClaimAttemptPayload) => {
      const { listingId, phrase, guestId, displayName } = payload;
      if (!listingId || !phrase?.trim()) return;

      const sessionUserId = socket.data.userId;
      const allowGuest = allowGuestClaim();

      if (!sessionUserId && !allowGuest) {
        socket.emit("claim:result", { outcome: "invalid" });
        return;
      }

      const effectiveUserId = sessionUserId;
      const effectiveGuestId =
        guestId?.trim() || sessionUserId || payload.userId?.trim();
      const effectiveName =
        socket.data.displayName?.trim() ||
        displayName?.trim() ||
        "Usuario";

      if (!effectiveGuestId && !effectiveUserId) return;

      const store = await getClaimStore();
      const result = await store.tryClaim({
        listingId,
        guestId: effectiveGuestId ?? effectiveUserId!,
        displayName: effectiveName,
        phrase,
        userId: effectiveUserId,
      });
      socket.emit("claim:result", result);

      if (result.outcome === "won" && result.paymentDeadline) {
        const state = await store.getState(listingId);
        const winner = state?.winner;
        if (winner) {
          io.to(listingRoomId(listingId)).emit("listing:locked", {
            listingId,
            winner: {
              guestId: winner.guestId,
              displayName: winner.displayName,
            },
            paymentDeadline: result.paymentDeadline,
          });
        }
        await emitState(io, listingId);
      } else if (result.outcome === "lost") {
        await emitState(io, listingId);
      }
    });

    socket.on("disconnect", async () => {
      const listingId = socketRooms.get(socket.id);
      if (listingId) {
        const store = await getClaimStore();
        await store.leaveRoom(listingId);
        socketRooms.delete(socket.id);
        await emitState(io, listingId);
      }
    });
  });
}
