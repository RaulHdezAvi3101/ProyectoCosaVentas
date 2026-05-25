import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { linkGuestToUser } from "@/lib/auth/guest-link";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import {
  normalizeEmail,
  normalizeHandle,
  validateEmail,
  validateHandle,
} from "@/lib/auth/validation";
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
    const displayName = String(body.displayName ?? "").trim();
    const handleRaw = String(body.handle ?? "").trim();
    const legacyGuestId = body.legacyGuestId
      ? String(body.legacyGuestId).trim()
      : null;

    if (!email || !password || !displayName || !handleRaw) {
      return NextResponse.json(
        { error: "Completa todos los campos" },
        { status: 400 }
      );
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }

    const handleError = validateHandle(handleRaw);
    if (handleError) {
      return NextResponse.json({ error: handleError }, { status: 400 });
    }

    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    if (displayName.length > 80) {
      return NextResponse.json(
        { error: "El nombre no puede superar 80 caracteres" },
        { status: 400 }
      );
    }

    const normalizedHandle = normalizeHandle(handleRaw);

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { handle: normalizedHandle }] },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email o usuario ya registrado" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName,
        handle: normalizedHandle,
        role: UserRole.buyer,
      },
    });

    if (legacyGuestId) {
      try {
        await linkGuestToUser(legacyGuestId, user.id);
      } catch (linkErr) {
        console.warn("[auth/register] guest link skipped", linkErr);
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
    console.error("[auth/register]", err);
    const prismaCode =
      err && typeof err === "object" && "code" in err
        ? String((err as { code: string }).code)
        : "";
    if (prismaCode === "P2002") {
      return NextResponse.json(
        { error: "Email o usuario ya registrado" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Error al registrar" },
      { status: 500 }
    );
  }
}
