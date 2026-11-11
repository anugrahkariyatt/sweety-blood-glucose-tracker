/*
  Warnings:

  - Changed the type of `slot` on the `Reading` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ReadingSlot" AS ENUM ('MORNING', 'AFTER_BREAKFAST', 'AFTER_LUNCH', 'AFTER_DINNER');

-- AlterTable
ALTER TABLE "Reading" DROP COLUMN "slot",
ADD COLUMN     "slot" "ReadingSlot" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Reading_userId_date_slot_key" ON "Reading"("userId", "date", "slot");
