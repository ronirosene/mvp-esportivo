-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MASCULINO', 'FEMININO', 'MISTO', 'OPEN');

-- CreateEnum
CREATE TYPE "AgeCategory" AS ENUM ('LIVRE', 'SUB_14', 'SUB_16', 'SUB_18', 'SUB_20', 'VETERANO', 'MASTER');

-- AlterTable
ALTER TABLE "Sport" ADD COLUMN "ativo" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Sport" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "EventSport" ADD COLUMN "gender" "Gender" NOT NULL DEFAULT 'OPEN';
ALTER TABLE "EventSport" ADD COLUMN "ageCategory" "AgeCategory" NOT NULL DEFAULT 'LIVRE';
ALTER TABLE "EventSport" ADD COLUMN "displayName" TEXT NOT NULL DEFAULT '';

-- DropIndex
DROP INDEX IF EXISTS "EventSport_eventId_sportId_key";

-- CreateIndex
CREATE UNIQUE INDEX "EventSport_eventId_sportId_gender_ageCategory_key" ON "EventSport"("eventId", "sportId", "gender", "ageCategory");
