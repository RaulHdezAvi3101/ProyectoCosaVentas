import { NextResponse } from "next/server";
import {
  clearSessionCookie,
  getSession,
  revokeAllSessionsForUser,
} from "@/lib/auth/session";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  await revokeAllSessionsForUser(session.id);
  await clearSessionCookie();

  return NextResponse.json({ ok: true });
}
