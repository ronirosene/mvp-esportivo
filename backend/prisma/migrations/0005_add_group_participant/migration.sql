-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_sportId_fkey";

-- DropIndex
DROP INDEX "Group_nome_eventId_sportId_key";

-- AlterTable
ALTER TABLE "City" ALTER COLUMN "siglaEstado" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "eventId",
DROP COLUMN "sportId",
ADD COLUMN     "eventSportId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "GroupParticipant" (
    "id" UUID NOT NULL,
    "groupId" UUID NOT NULL,
    "eventSportCityId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupParticipant_eventSportCityId_key" ON "GroupParticipant"("eventSportCityId");

-- CreateIndex
CREATE UNIQUE INDEX "Group_nome_eventSportId_key" ON "Group"("nome", "eventSportId");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_eventSportId_fkey" FOREIGN KEY ("eventSportId") REFERENCES "EventSport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupParticipant" ADD CONSTRAINT "GroupParticipant_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupParticipant" ADD CONSTRAINT "GroupParticipant_eventSportCityId_fkey" FOREIGN KEY ("eventSportCityId") REFERENCES "EventSportCity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
