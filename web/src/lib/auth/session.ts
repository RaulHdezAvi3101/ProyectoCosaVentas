import { cookies, headers } from "next/headers";
import type { SessionUser } from "@/types/auth";
import { SESSION_COOKIE, SESSION_MAX_AGE_SEC } from "./session-constants";
import {
  createDbSession,
  resolveSessionFromToken,
  revokeSessionByToken,
} from "./session-resolve";

export type { SessionUser };
export { parseSessionTokenFromCookieHeader } from "./parse-cookie";
export {
  createSessionToken,
  resolveSessionFromToken,
  revokeAllSessionsForUser,
  toSessionUser,
} from "./session-resolve";

export { SESSION_COOKIE, SESSION_MAX_AGE_SEC };

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  };
}

async function readRequestMeta(): Promise<{
  userAgent: string | null;
  ip: string | null;
}> {
  try {
    const h = headers();
    const userAgent = h.get("user-agent");
    const forwarded = h.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? h.get("x-real-ip");
    return { userAgent, ip: ip ?? null };
  } catch {
    return { userAgent: null, ip: null };
  }
}

export async function setSessionCookie(user: SessionUser): Promise<void> {
  const meta = await readRequestMeta();
  const token = await createDbSession(user.id, meta);
  cookies().set(SESSION_COOKIE, token, sessionCookieOptions());
}

export async function clearSessionCookie(): Promise<void> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) await revokeSessionByToken(token);
  cookies().set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
}

export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return resolveSessionFromToken(token);
}
