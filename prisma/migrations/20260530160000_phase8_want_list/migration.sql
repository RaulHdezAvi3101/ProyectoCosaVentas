-- Fase 8: want list pública y ofertas directas

CREATE TYPE "WantStatus" AS ENUM ('active', 'fulfilled', 'closed');
CREATE TYPE "WantOfferStatus" AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');

CREATE TABLE "WantListItem" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "desiredCondition" TEXT NOT NULL,
    "targetPriceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "status" "WantStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WantListItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WantOffer" (
    "id" TEXT NOT NULL,
    "wantId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "listingId" TEXT,
    "priceCents" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "status" "WantOfferStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WantOffer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WantListItem_slug_key" ON "WantListItem"("slug");
CREATE INDEX "WantListItem_userId_status_idx" ON "WantListItem"("userId", "status");
CREATE INDEX "WantListItem_status_createdAt_idx" ON "WantListItem"("status", "createdAt");
CREATE UNIQUE INDEX "WantOffer_wantId_sellerId_key" ON "WantOffer"("wantId", "sellerId");
CREATE INDEX "WantOffer_wantId_createdAt_idx" ON "WantOffer"("wantId", "createdAt");

ALTER TABLE "WantListItem" ADD CONSTRAINT "WantListItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WantOffer" ADD CONSTRAINT "WantOffer_wantId_fkey" FOREIGN KEY ("wantId") REFERENCES "WantListItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WantOffer" ADD CONSTRAINT "WantOffer_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WantOffer" ADD CONSTRAINT "WantOffer_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
