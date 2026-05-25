import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@prisma/client";
import type { SessionUser } from "@/types/auth";
import { SESSION_MAX_AGE_SEC } from "./session-constants";

interface SessionPayload {
  sub: string;
  email: string;
  displayName: string;
  handle: string;
  role: UserRole;
  avatarUrl: string | null;
  legacyGuestId: string | null;
}

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET debe tener al menos 32 caracteres (ver .env.example)"
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    email: user.email,
    displayName: user.displayName,
    handle: user.handle,
    role: user.role,
    avatarUrl: user.avatarUrl,
    legacyGuestId: user.legacyGuestId,
  } satisfies Omit<SessionPayload, "sub">)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SEC}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });

    const sub = payload.sub;
    if (!sub || typeof sub !== "string") return null;

    return {
      id: sub,
      email: String(payload.email ?? ""),
      displayName: String(payload.displayName ?? ""),
      handle: String(payload.handle ?? ""),
      role: (payload.role as UserRole) ?? "buyer",
      avatarUrl: (payload.avatarUrl as string | null) ?? null,
      legacyGuestId: (payload.legacyGuestId as string | null) ?? null,
    };
  } catch {
    return null;
  }
}
