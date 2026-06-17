-- CreateEnum
CREATE TYPE "InscricaoStatus" AS ENUM ('INSCRITO', 'CONFIRMADO', 'DESISTENTE');

-- CreateTable
CREATE TABLE "EventSportCity" (
    "id" UUID NOT NULL,
    "eventSportId" UUID NOT NULL,
    "cityId" UUID NOT NULL,
    "status" "InscricaoStatus" NOT NULL DEFAULT 'INSCRITO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventSportCity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventSportCity_eventSportId_cityId_key" ON "EventSportCity"("eventSportId", "cityId");

-- AddForeignKey
ALTER TABLE "EventSportCity" ADD CONSTRAINT "EventSportCity_eventSportId_fkey" FOREIGN KEY ("eventSportId") REFERENCES "EventSport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSportCity" ADD CONSTRAINT "EventSportCity_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
