import { NextResponse } from "next/server";
import type { UserRole } from "@prisma/client";
import type { SessionUser } from "@/types/auth";
import { getSession } from "./session";

export async function requireSession(
  roles?: UserRole[]
): Promise<SessionUser | NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (roles && !roles.includes(session.role)) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }
  return session;
}

export function isSessionUser(
  value: SessionUser | NextResponse
): value is SessionUser {
  return !(value instanceof NextResponse);
}
