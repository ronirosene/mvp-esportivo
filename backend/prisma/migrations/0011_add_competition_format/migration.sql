-- CreateEnum
CREATE TYPE "FormatType" AS ENUM ('GROUP_STAGE', 'ROUND_ROBIN', 'KNOCKOUT', 'MANUAL');

-- CreateTable
CREATE TABLE "CompetitionFormat" (
    "id" UUID NOT NULL,
    "eventSportId" UUID NOT NULL,
    "formatType" "FormatType" NOT NULL DEFAULT 'GROUP_STAGE',
    "groupCount" INTEGER NOT NULL DEFAULT 2,
    "qualifiedPerGroup" INTEGER NOT NULL DEFAULT 2,
    "thirdPlaceMatch" BOOLEAN NOT NULL DEFAULT true,
    "manualBracket" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetitionFormat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompetitionFormat_eventSportId_key" ON "CompetitionFormat"("eventSportId");

-- AddForeignKey
ALTER TABLE "CompetitionFormat" ADD CONSTRAINT "CompetitionFormat_eventSportId_fkey" FOREIGN KEY ("eventSportId") REFERENCES "EventSport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

