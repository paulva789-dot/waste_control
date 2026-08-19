-- AlterEnum
ALTER TYPE "PaymentType" ADD VALUE 'TOWN_CHANGE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pendingTown" TEXT,
ADD COLUMN     "town" TEXT;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "description" TEXT,
ADD COLUMN     "town" TEXT;
