import { createHash, randomBytes } from "crypto";

export function generateOpaqueSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** JWT tiene exactamente tres segmentos base64url separados por puntos. */
export function isJwtFormat(token: string): boolean {
  const parts = token.split(".");
  return parts.length === 3 && parts.every((p) => p.length > 0);
}
