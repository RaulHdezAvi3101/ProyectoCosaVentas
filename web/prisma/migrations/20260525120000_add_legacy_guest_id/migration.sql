-- AlterTable
ALTER TABLE "User" ADD COLUMN "legacyGuestId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_legacyGuestId_key" ON "User"("legacyGuestId");
