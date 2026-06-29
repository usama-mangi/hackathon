-- AlterTable
ALTER TABLE "team" ADD COLUMN "submissionUpdates" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "submission_id_teamId_key" ON "submission"("id", "teamId");
