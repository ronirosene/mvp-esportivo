DELETE FROM "Match";

-- AlterEnum
BEGIN;
CREATE TYPE "MatchStatus_new" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'FINISHED', 'CANCELLED');
ALTER TABLE "Match" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Match" ALTER COLUMN "status" TYPE "MatchStatus_new" USING ("status"::text::"MatchStatus_new");
ALTER TYPE "MatchStatus" RENAME TO "MatchStatus_old";
ALTER TYPE "MatchStatus_new" RENAME TO "MatchStatus";
DROP TYPE "MatchStatus_old";
ALTER TABLE "Match" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';
COMMIT;

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_sportId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_teamAId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_teamBId_fkey";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "dataHora",
DROP COLUMN "eventId",
DROP COLUMN "local",
DROP COLUMN "placarA",
DROP COLUMN "placarB",
DROP COLUMN "sportId",
DROP COLUMN "teamAId",
DROP COLUMN "teamBId",
ADD COLUMN     "awayCityId" UUID NOT NULL,
ADD COLUMN     "awayScore" INTEGER,
ADD COLUMN     "eventSportId" UUID NOT NULL,
ADD COLUMN     "groupId" UUID NOT NULL,
ADD COLUMN     "homeCityId" UUID NOT NULL,
ADD COLUMN     "homeScore" INTEGER,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "matchDate" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_eventSportId_fkey" FOREIGN KEY ("eventSportId") REFERENCES "EventSport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_homeCityId_fkey" FOREIGN KEY ("homeCityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_awayCityId_fkey" FOREIGN KEY ("awayCityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
