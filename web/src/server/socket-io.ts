import type { Server } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/types/socket";

let io: Server<ClientToServerEvents, ServerToClientEvents> | null = null;

export function setSocketIo(
  server: Server<ClientToServerEvents, ServerToClientEvents>
) {
  io = server;
}

export function getSocketIo() {
  return io;
}

export function listingRoomId(slug: string) {
  return `listing:${slug}`;
}
