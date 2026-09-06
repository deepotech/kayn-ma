-- CreateEnum
CREATE TYPE "AgencyClaimStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "AgencyClaim" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "notes" TEXT,
    "status" "AgencyClaimStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgencyClaim_agencyId_idx" ON "AgencyClaim"("agencyId");

-- CreateIndex
CREATE INDEX "AgencyClaim_userId_idx" ON "AgencyClaim"("userId");

-- CreateIndex
CREATE INDEX "AgencyClaim_reviewedById_idx" ON "AgencyClaim"("reviewedById");

-- CreateIndex
CREATE INDEX "AgencyClaim_status_idx" ON "AgencyClaim"("status");

-- CreateIndex
CREATE INDEX "AgencyClaim_createdAt_idx" ON "AgencyClaim"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "AgencyClaim" ADD CONSTRAINT "AgencyClaim_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyClaim" ADD CONSTRAINT "AgencyClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyClaim" ADD CONSTRAINT "AgencyClaim_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "unique_user_agency_pending_claim"
ON "AgencyClaim" ("agencyId", "userId")
WHERE "status" = 'PENDING';
