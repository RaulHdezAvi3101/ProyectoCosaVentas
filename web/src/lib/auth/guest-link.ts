import { prisma } from "@/server/db";

function normalizeGuestUserId(guestId: string): string {
  return guestId.startsWith("guest-") ? guestId : `guest-${guestId}`;
}

/**
 * Vincula intentos/reservas del usuario guest temporal a la cuenta real.
 * No falla si legacyGuestId ya pertenece a otro usuario (mismo navegador, varias cuentas).
 */
export async function linkGuestToUser(
  guestId: string,
  userId: string
): Promise<void> {
  const guestUserId = normalizeGuestUserId(guestId);
  if (guestUserId === userId) return;

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { legacyGuestId: true },
  });
  if (currentUser?.legacyGuestId === guestId) return;

  const takenByOther = await prisma.user.findFirst({
    where: {
      legacyGuestId: guestId,
      NOT: { id: userId },
    },
    select: { id: true },
  });

  const guestExists = await prisma.user.findUnique({
    where: { id: guestUserId },
    select: { id: true },
  });

  await prisma.$transaction(async (tx) => {
    if (guestExists) {
      await tx.claimAttempt.updateMany({
        where: { userId: guestUserId },
        data: { userId },
      });
      await tx.reservation.updateMany({
        where: { winnerId: guestUserId },
        data: { winnerId: userId },
      });
    }

    if (!takenByOther) {
      await tx.user.update({
        where: { id: userId },
        data: { legacyGuestId: guestId },
      });
    }
  });
}
