-- AlterTable
ALTER TABLE "EventSport" ADD COLUMN     "classificationCount" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "generateThirdPlace" BOOLEAN NOT NULL DEFAULT true;

