import bcrypt from "bcrypt";
import { prisma } from "@/server/db";
import { SESSION_MAX_AGE_MS } from "@/lib/auth/session-constants";
import {
  createSessionToken,
  hashSessionToken,
} from "@/lib/auth/token";
import { AuthError, AUTH_ERROR_MESSAGES } from "@/features/auth/errors";
import type { LoginInput } from "@/features/auth/validation";

export interface LoginResult {
  userId: string;
  sessionToken: string;
}

export async function login(
  input: LoginInput,
  meta?: { userAgent?: string; ip?: string },
): Promise<LoginResult> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, passwordHash: true },
  });

  if (!user) {
    throw new AuthError(AUTH_ERROR_MESSAGES.invalidCredentials, 401);
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);

  if (!valid) {
    throw new AuthError(AUTH_ERROR_MESSAGES.invalidCredentials, 401);
  }

  const sessionToken = createSessionToken();
  const tokenHash = hashSessionToken(sessionToken);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);

  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash,
      userAgent: meta?.userAgent,
      ip: meta?.ip,
      expiresAt,
    },
  });

  return { userId: user.id, sessionToken };
}
