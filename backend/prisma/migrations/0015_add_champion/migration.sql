-- Migration 0015: Add Champion model and ChampionPosition enum

-- Create ChampionPosition enum
CREATE TYPE "ChampionPosition" AS ENUM ('CHAMPION', 'RUNNER_UP', 'THIRD_PLACE');

-- Create Champion table
CREATE TABLE "Champion" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "eventSportId" UUID NOT NULL,
    "cityId" UUID NOT NULL,
    "position" "ChampionPosition" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Champion_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Champion_eventSportId_position_key" UNIQUE ("eventSportId", "position")
);

-- Add foreign keys
ALTER TABLE "Champion" ADD CONSTRAINT "Champion_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Champion" ADD CONSTRAINT "Champion_eventSportId_fkey" FOREIGN KEY ("eventSportId") REFERENCES "EventSport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Champion" ADD CONSTRAINT "Champion_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
