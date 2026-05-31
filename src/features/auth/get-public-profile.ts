import { prisma } from "@/server/db";
import type { PublicProfile } from "@/features/auth/types";

export async function getPublicProfile(
  userId: string,
): Promise<PublicProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      displayName: true,
      handle: true,
      avatarUrl: true,
      sellerProfile: {
        select: {
          score: true,
          tier: true,
          sales: true,
          positiveRate: true,
          onTimeShipping: true,
          avgShipHours: true,
          responseRate: true,
          memberSince: true,
        },
      },
    },
  });

  if (!user?.sellerProfile) {
    return null;
  }

  return {
    id: user.id,
    displayName: user.displayName,
    handle: user.handle,
    avatarUrl: user.avatarUrl,
    sellerProfile: user.sellerProfile,
  };
}
