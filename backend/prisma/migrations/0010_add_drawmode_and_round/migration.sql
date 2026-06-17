-- CreateEnum
CREATE TYPE "DrawMode" AS ENUM ('AUTOMATIC', 'MANUAL');

-- AlterTable
ALTER TABLE "EventSport" ADD COLUMN     "drawMode" "DrawMode" NOT NULL DEFAULT 'AUTOMATIC';

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "displayOrder" INTEGER,
ADD COLUMN     "round" INTEGER;

