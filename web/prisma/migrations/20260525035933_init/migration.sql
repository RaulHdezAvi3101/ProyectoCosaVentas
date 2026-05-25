-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('draft', 'active', 'live', 'locked', 'sold');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('buyer', 'seller', 'admin');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'buyer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "tier" TEXT NOT NULL DEFAULT 'nuevo',
    "sales" INTEGER NOT NULL DEFAULT 0,
    "positiveRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "onTimeShipping" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "memberSince" TEXT NOT NULL,

    CONSTRAINT "SellerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "category" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "imageUrls" TEXT[],
    "status" "ListingStatus" NOT NULL DEFAULT 'active',
    "firstToClaim" BOOLEAN NOT NULL DEFAULT false,
    "claimPhraseHash" TEXT,
    "phraseHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimAttempt" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phrasePreview" TEXT NOT NULL,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "winnerId" TEXT NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentDeadlineAt" TIMESTAMP(3) NOT NULL,
    "releasedAt" TIMESTAMP(3),
    "bullJobId" TEXT,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_handle_key" ON "User"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "SellerProfile_userId_key" ON "SellerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_slug_key" ON "Listing"("slug");

-- CreateIndex
CREATE INDEX "ClaimAttempt_listingId_createdAt_idx" ON "ClaimAttempt"("listingId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_listingId_key" ON "Reservation"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_reservationId_key" ON "Order"("reservationId");

-- AddForeignKey
ALTER TABLE "SellerProfile" ADD CONSTRAINT "SellerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimAttempt" ADD CONSTRAINT "ClaimAttempt_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimAttempt" ADD CONSTRAINT "ClaimAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
