import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import { prisma } from "@/server/db";
import { isGuestClaimAllowed } from "@/server/claim/config";

export interface ClaimIdentity {
  userId: string;
  displayName: string;
}

const GUEST_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeGuestId(rawGuestId: string): string | null {
  const trimmed = rawGuestId.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("guest-")) {
    const suffix = trimmed.slice("guest-".length);
    return GUEST_ID_PATTERN.test(suffix) ? trimmed : null;
  }

  return GUEST_ID_PATTERN.test(trimmed) ? `guest-${trimmed}` : null;
}

function sanitizeDisplayName(rawDisplayName: string): string {
  const trimmed = rawDisplayName.trim().slice(0, 40);
  return trimmed || "Invitado";
}

function guestHandle(guestId: string): string {
  const suffix = guestId.replace(/[^a-zA-Z0-9]/g, "").slice(-16);
  return `@guest_${suffix}`;
}

export async function ensureClaimUser(
  guestId: string,
  displayName: string,
): Promise<ClaimIdentity | null> {
  if (!isGuestClaimAllowed()) {
    return null;
  }

  const normalizedGuestId = normalizeGuestId(guestId);
  if (!normalizedGuestId) {
    return null;
  }

  const safeDisplayName = sanitizeDisplayName(displayName);
  const email = `${normalizedGuestId}@guest.local.dev`;
  const passwordHash = await bcrypt.hash(randomBytes(24).toString("hex"), 4);

  const user = await prisma.user.upsert({
    where: { id: normalizedGuestId },
    update: {
      displayName: safeDisplayName,
    },
    create: {
      id: normalizedGuestId,
      email,
      passwordHash,
      displayName: safeDisplayName,
      handle: guestHandle(normalizedGuestId),
    },
    select: {
      id: true,
      displayName: true,
    },
  });

  return {
    userId: user.id,
    displayName: user.displayName,
  };
}
