import { NextResponse } from "next/server";
import { linkGuestToUser } from "@/lib/auth/guest-link";
import { MAX_PASSWORD_LENGTH, verifyPassword } from "@/lib/auth/password";
import { normalizeEmail, validateEmail } from "@/lib/auth/validation";
import {
  clearSessionCookie,
  setSessionCookie,
  toSessionUser,
} from "@/lib/auth/session";
import { prisma } from "@/server/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(String(body.email ?? ""));
    const password = String(body.password ?? "");
    const legacyGuestId = body.legacyGuestId
      ? String(body.legacyGuestId).trim()
      : null;

    const emailError = validateEmail(email);
    if (emailError || !password) {
      return NextResponse.json(
        { error: emailError ?? "Email y contraseña requeridos" },
        { status: 400 }
      );
    }

    if (password.length > MAX_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    if (legacyGuestId) {
      try {
        await linkGuestToUser(legacyGuestId, user.id);
      } catch (linkErr) {
        console.warn("[auth/login] guest link skipped", linkErr);
      }
    }

    const refreshed = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });

    await clearSessionCookie();

    const sessionUser = toSessionUser(refreshed);
    await setSessionCookie(sessionUser);

    return NextResponse.json({ user: sessionUser });
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json({ error: "Error al iniciar sesión" }, { status: 500 });
  }
}
