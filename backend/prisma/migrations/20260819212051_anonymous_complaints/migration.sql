-- DropForeignKey
ALTER TABLE "Complaint" DROP CONSTRAINT "Complaint_reporterId_fkey";

-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "reporterPhone" TEXT,
ALTER COLUMN "reporterId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
