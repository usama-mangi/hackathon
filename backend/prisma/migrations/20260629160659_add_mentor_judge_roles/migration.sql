-- CreateTable
CREATE TABLE "hackathon_role_application" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "bio" TEXT NOT NULL,
    "motivation" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "skills" TEXT,
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "availability" TEXT,
    "expertiseArea" TEXT,
    "priorJudgingExp" TEXT,
    "conflictStatement" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hackathon_role_application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hackathon_mentor" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hackathon_mentor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hackathon_judge" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hackathon_judge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hackathon_role_application_hackathonId_userId_roleType_key" ON "hackathon_role_application"("hackathonId", "userId", "roleType");

-- CreateIndex
CREATE UNIQUE INDEX "hackathon_mentor_applicationId_key" ON "hackathon_mentor"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "hackathon_mentor_hackathonId_userId_key" ON "hackathon_mentor"("hackathonId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "hackathon_judge_applicationId_key" ON "hackathon_judge"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "hackathon_judge_hackathonId_userId_key" ON "hackathon_judge"("hackathonId", "userId");

-- AddForeignKey
ALTER TABLE "hackathon_role_application" ADD CONSTRAINT "hackathon_role_application_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_role_application" ADD CONSTRAINT "hackathon_role_application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_mentor" ADD CONSTRAINT "hackathon_mentor_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_mentor" ADD CONSTRAINT "hackathon_mentor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_mentor" ADD CONSTRAINT "hackathon_mentor_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "hackathon_role_application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_judge" ADD CONSTRAINT "hackathon_judge_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_judge" ADD CONSTRAINT "hackathon_judge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_judge" ADD CONSTRAINT "hackathon_judge_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "hackathon_role_application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
