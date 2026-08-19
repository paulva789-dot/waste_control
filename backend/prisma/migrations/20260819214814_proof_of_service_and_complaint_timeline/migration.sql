-- AlterTable
ALTER TABLE "PickupRequest" ADD COLUMN     "binCount" INTEGER,
ADD COLUMN     "completionLatitude" DOUBLE PRECISION,
ADD COLUMN     "completionLongitude" DOUBLE PRECISION,
ADD COLUMN     "completionPhotoUrl" TEXT;

-- CreateTable
CREATE TABLE "ComplaintStatusEvent" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "status" "ComplaintStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplaintStatusEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ComplaintStatusEvent" ADD CONSTRAINT "ComplaintStatusEvent_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
