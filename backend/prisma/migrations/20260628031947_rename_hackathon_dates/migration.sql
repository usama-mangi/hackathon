/*
  Warnings:

  - You are about to drop the column `endDate` on the `hackathon` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `hackathon` table. All the data in the column will be lost.
  - Added the required column `endsAt` to the `hackathon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startsAt` to the `hackathon` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "hackathon" DROP COLUMN "endDate",
DROP COLUMN "startDate",
ADD COLUMN     "endsAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startsAt" TIMESTAMP(3) NOT NULL;
