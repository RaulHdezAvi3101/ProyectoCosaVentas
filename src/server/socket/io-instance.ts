import type { Server } from "socket.io";

const globalForIo = globalThis as unknown as {
  io: Server | undefined;
};

export function setIo(server: Server): void {
  globalForIo.io = server;
}

export function getIo(): Server {
  if (!globalForIo.io) {
    throw new Error("Socket.io server is not initialized");
  }

  return globalForIo.io;
}
