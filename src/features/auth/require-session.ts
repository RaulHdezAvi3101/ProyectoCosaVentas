import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/get-session";
import type { AuthSession } from "@/features/auth/types";

export async function requireSession(nextPath?: string): Promise<AuthSession> {
  const session = await getSession();

  if (!session) {
    const loginUrl = nextPath
      ? `/auth/login?next=${encodeURIComponent(nextPath)}`
      : "/auth/login";
    redirect(loginUrl);
  }

  return session;
}
