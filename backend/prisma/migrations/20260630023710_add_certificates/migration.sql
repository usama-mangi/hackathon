-- CreateTable
CREATE TABLE "certificate" (
    "id" TEXT NOT NULL,
    "certificateId" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "hackathonName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "placement" INTEGER,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "certificate_certificateId_key" ON "certificate"("certificateId");

-- CreateIndex
CREATE UNIQUE INDEX "certificate_hackathonId_userId_type_key" ON "certificate"("hackathonId", "userId", "type");

-- AddForeignKey
ALTER TABLE "certificate" ADD CONSTRAINT "certificate_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate" ADD CONSTRAINT "certificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
