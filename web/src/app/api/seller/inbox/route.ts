import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { isSessionUser, requireSession } from "@/lib/auth/require-session";
import { getClaimStore } from "@/server/claim";

export async function GET() {
  const session = await requireSession([UserRole.seller, UserRole.admin]);
  if (!isSessionUser(session)) return session;

  const store = await getClaimStore();
  const chats = await store.getInboxForSeller(session.id);
  return NextResponse.json({ chats });
}
