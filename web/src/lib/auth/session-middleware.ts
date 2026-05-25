import { isJwtFormat } from "./session-token";
import { verifySessionToken } from "./session-jwt";

/**
 * Middleware (Edge): JWT verificable con jose; token opaco solo comprueba formato.
 * La validación completa en BD ocurre en páginas/API vía getSession().
 */
export async function isSessionTokenValidForMiddleware(
  token: string
): Promise<boolean> {
  if (isJwtFormat(token)) {
    return (await verifySessionToken(token)) !== null;
  }
  return token.length >= 32;
}
