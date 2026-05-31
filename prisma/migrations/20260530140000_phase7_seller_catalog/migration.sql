-- Fase 7: perfil vendedor, bundles pick-N-of-M, follow

ALTER TABLE "SellerProfile" ADD COLUMN "avgShipHours" INTEGER NOT NULL DEFAULT 48;
ALTER TABLE "SellerProfile" ADD COLUMN "responseRate" INTEGER NOT NULL DEFAULT 0;

CREATE TYPE "BundleStatus" AS ENUM ('draft', 'active', 'sold', 'archived');

CREATE TABLE "Bundle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "pickCount" INTEGER,
    "status" "BundleStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bundle_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BundleItem" (
    "id" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BundleItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SellerFollow" (
    "followerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellerFollow_pkey" PRIMARY KEY ("followerId","sellerId")
);

CREATE UNIQUE INDEX "Bundle_slug_key" ON "Bundle"("slug");
CREATE UNIQUE INDEX "BundleItem_bundleId_listingId_key" ON "BundleItem"("bundleId", "listingId");
CREATE INDEX "BundleItem_listingId_idx" ON "BundleItem"("listingId");
CREATE INDEX "SellerFollow_sellerId_idx" ON "SellerFollow"("sellerId");

ALTER TABLE "Bundle" ADD CONSTRAINT "Bundle_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BundleItem" ADD CONSTRAINT "BundleItem_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BundleItem" ADD CONSTRAINT "BundleItem_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SellerFollow" ADD CONSTRAINT "SellerFollow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SellerFollow" ADD CONSTRAINT "SellerFollow_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
