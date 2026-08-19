-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('UNLOCK_TRACKING', 'PREMIUM_MEMBERSHIP', 'SPECIAL_PICKUP');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "type" "PaymentType" NOT NULL DEFAULT 'UNLOCK_TRACKING';

-- AlterTable
ALTER TABLE "PickupRequest" ADD COLUMN     "isSpecial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priceXAF" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hasUnlockedTracking" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "premiumUntil" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "truckColor" TEXT NOT NULL DEFAULT 'White';
