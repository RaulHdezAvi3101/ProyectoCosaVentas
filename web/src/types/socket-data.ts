/** Datos de sesión adjuntos al socket tras el handshake (cookie validada en servidor). */
export type SocketSessionData = {
  userId?: string;
  displayName?: string;
};

declare module "socket.io" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface SocketData extends SocketSessionData {}
}
