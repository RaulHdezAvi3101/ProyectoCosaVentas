import { prisma } from "@/server/db";

export async function isFollowingSeller(
  followerId: string,
  sellerId: string,
): Promise<boolean> {
  if (followerId === sellerId) {
    return false;
  }

  const row = await prisma.sellerFollow.findUnique({
    where: {
      followerId_sellerId: { followerId, sellerId },
    },
    select: { followerId: true },
  });

  return row !== null;
}

export async function followSeller(
  followerId: string,
  sellerId: string,
): Promise<void> {
  if (followerId === sellerId) {
    throw new Error("No puedes seguirte a ti mismo.");
  }

  const seller = await prisma.user.findUnique({
    where: { id: sellerId },
    select: { id: true, sellerProfile: { select: { userId: true } } },
  });

  if (!seller?.sellerProfile) {
    throw new Error("Vendedor no encontrado.");
  }

  await prisma.sellerFollow.upsert({
    where: {
      followerId_sellerId: { followerId, sellerId },
    },
    create: { followerId, sellerId },
    update: {},
  });
}

export async function unfollowSeller(
  followerId: string,
  sellerId: string,
): Promise<void> {
  await prisma.sellerFollow.deleteMany({
    where: { followerId, sellerId },
  });
}

export async function countSellerFollowers(sellerId: string): Promise<number> {
  return prisma.sellerFollow.count({ where: { sellerId } });
}
