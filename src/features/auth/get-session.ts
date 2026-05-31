import { cookies } from "next/headers";
import { prisma } from "@/server/db";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session-constants";
import { hashSessionToken } from "@/lib/auth/token";
import type { AuthSession } from "@/features/auth/types";

export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const tokenHash = hashSessionToken(token);
  const session = await prisma.session.findFirst({
    where: {
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          displayName: true,
          handle: true,
          avatarUrl: true,
          role: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  return {
    sessionId: session.id,
    user: session.user,
  };
}
