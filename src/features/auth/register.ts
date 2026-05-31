import bcrypt from "bcrypt";
import { prisma } from "@/server/db";
import { SESSION_MAX_AGE_MS } from "@/lib/auth/session-constants";
import {
  createSessionToken,
  hashSessionToken,
} from "@/lib/auth/token";
import { AuthError, AUTH_ERROR_MESSAGES } from "@/features/auth/errors";
import type { RegisterInput } from "@/features/auth/validation";

const BCRYPT_ROUNDS = 12;

export interface RegisterResult {
  userId: string;
  sessionToken: string;
}

export async function register(
  input: RegisterInput,
  meta?: { userAgent?: string; ip?: string },
): Promise<RegisterResult> {
  const existingEmail = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existingEmail) {
    throw new AuthError(AUTH_ERROR_MESSAGES.emailTaken, 409);
  }

  const existingHandle = await prisma.user.findUnique({
    where: { handle: input.handle },
    select: { id: true },
  });

  if (existingHandle) {
    throw new AuthError(AUTH_ERROR_MESSAGES.handleTaken, 409);
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const sessionToken = createSessionToken();
  const tokenHash = hashSessionToken(sessionToken);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);
  const memberSince = new Date().getFullYear().toString();

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      displayName: input.displayName,
      handle: input.handle,
      sellerProfile: {
        create: {
          memberSince,
        },
      },
      sessions: {
        create: {
          tokenHash,
          userAgent: meta?.userAgent,
          ip: meta?.ip,
          expiresAt,
        },
      },
    },
    select: { id: true },
  });

  return { userId: user.id, sessionToken };
}
