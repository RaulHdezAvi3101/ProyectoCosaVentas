import { prisma } from "@/server/db";
import { hashSessionToken } from "@/lib/auth/token";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session-constants";
import {
  ensureClaimUser,
  type ClaimIdentity,
} from "@/server/claim/ensure-claim-user";
import { isGuestClaimAllowed } from "@/server/claim/config";

function parseCookieHeader(
  cookieHeader: string | undefined,
): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(";").reduce<Record<string, string>>((acc, part) => {
    const separatorIndex = part.indexOf("=");
    if (separatorIndex === -1) {
      return acc;
    }

    const key = part.slice(0, separatorIndex).trim();
    const value = part.slice(separatorIndex + 1).trim();
    if (!key) {
      return acc;
    }

    acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

async function resolveSessionIdentity(
  cookieHeader: string | undefined,
): Promise<ClaimIdentity | null> {
  const cookies = parseCookieHeader(cookieHeader);
  const token = cookies[SESSION_COOKIE_NAME];
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
          displayName: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  return {
    userId: session.user.id,
    displayName: session.user.displayName,
  };
}

interface SocketAuthPayload {
  guestId?: string;
  displayName?: string;
}

export async function resolveClaimIdentity(input: {
  cookieHeader?: string;
  auth?: SocketAuthPayload;
}): Promise<ClaimIdentity | null> {
  const sessionIdentity = await resolveSessionIdentity(input.cookieHeader);
  if (sessionIdentity) {
    return sessionIdentity;
  }

  if (!isGuestClaimAllowed()) {
    return null;
  }

  const guestId = input.auth?.guestId;
  const displayName = input.auth?.displayName;
  if (!guestId || !displayName) {
    return null;
  }

  return ensureClaimUser(guestId, displayName);
}
