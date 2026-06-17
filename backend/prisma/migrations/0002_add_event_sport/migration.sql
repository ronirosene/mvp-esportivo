-- CreateTable
CREATE TABLE "EventSport" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "sportId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventSport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventSport_eventId_sportId_key" ON "EventSport"("eventId", "sportId");

-- AddForeignKey
ALTER TABLE "EventSport" ADD CONSTRAINT "EventSport_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSport" ADD CONSTRAINT "EventSport_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
