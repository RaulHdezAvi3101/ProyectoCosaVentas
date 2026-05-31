import { cookies } from "next/headers";
import { prisma } from "@/server/db";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session-constants";
import { hashSessionToken } from "@/lib/auth/token";

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    const tokenHash = hashSessionToken(token);
    await prisma.session.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}
