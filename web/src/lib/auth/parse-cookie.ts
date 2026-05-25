import { SESSION_COOKIE } from "./session-constants";

/** Extrae el valor de una cookie desde el header `Cookie` (handshake Socket.io, etc.). */
export function parseSessionTokenFromCookieHeader(
  cookieHeader: string | undefined
): string | null {
  if (!cookieHeader) return null;
  const prefix = `${SESSION_COOKIE}=`;
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      try {
        return decodeURIComponent(trimmed.slice(prefix.length));
      } catch {
        return trimmed.slice(prefix.length);
      }
    }
  }
  return null;
}
