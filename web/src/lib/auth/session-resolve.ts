import type { UserRole } from "@prisma/client";
import type { SessionUser } from "@/types/auth";
import { prisma } from "@/server/db";
import { SESSION_MAX_AGE_SEC } from "./session-constants";
import { verifySessionToken } from "./session-jwt";
import {
  generateOpaqueSessionToken,
  hashSessionToken,
  isJwtFormat,
} from "./session-token";

export { createSessionToken, verifySessionToken } from "./session-jwt";

async function loadSessionUserFromDb(userId: string): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  return toSessionUser(user);
}

async function resolveOpaqueSession(token: string): Promise<SessionUser | null> {
  const tokenHash = hashSessionToken(token);
  const row = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!row || row.revokedAt || row.expiresAt < new Date()) {
    return null;
  }

  return toSessionUser(row.user);
}

/** Resuelve sesión desde token (opaco en BD o JWT legado). Sin next/headers — seguro para server.ts. */
export async function resolveSessionFromToken(
  token: string
): Promise<SessionUser | null> {
  if (!token) return null;
  if (isJwtFormat(token)) {
    const jwtUser = await verifySessionToken(token);
    if (!jwtUser) return null;
    return loadSessionUserFromDb(jwtUser.id);
  }
  return resolveOpaqueSession(token);
}

function sessionExpiresAt(): Date {
  return new Date(Date.now() + SESSION_MAX_AGE_SEC * 1000);
}

/** Crea fila Session en PG y devuelve token opaco para la cookie. */
export async function createDbSession(
  userId: string,
  meta?: { userAgent?: string | null; ip?: string | null }
): Promise<string> {
  const token = generateOpaqueSessionToken();
  const tokenHash = hashSessionToken(token);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      userAgent: meta?.userAgent ?? undefined,
      ip: meta?.ip ?? undefined,
      expiresAt: sessionExpiresAt(),
    },
  });

  return token;
}

export async function revokeSessionByToken(token: string): Promise<void> {
  if (!token || isJwtFormat(token)) return;
  const tokenHash = hashSessionToken(token);
  await prisma.session.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function revokeAllSessionsForUser(userId: string): Promise<void> {
  await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export function toSessionUser(user: {
  id: string;
  email: string;
  displayName: string;
  handle: string;
  role: UserRole;
  avatarUrl: string | null;
  legacyGuestId: string | null;
}): SessionUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    handle: user.handle,
    role: user.role,
    avatarUrl: user.avatarUrl,
    legacyGuestId: user.legacyGuestId,
  };
}
