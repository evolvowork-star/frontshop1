/*
  Warnings:

  - Added the required column `amountEur` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packageSnapshot` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "amountEur" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "packageSnapshot" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "deliveryDays" INTEGER NOT NULL DEFAULT 7,
ADD COLUMN     "tagline" TEXT NOT NULL DEFAULT 'pack',
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'light';
