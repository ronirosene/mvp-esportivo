import { Module } from '@nestjs/common';
import { EventSportCitiesController } from './controllers/event-sport-cities.controller';
import { EventSportCitiesService } from './services/event-sport-cities.service';

@Module({
  controllers: [EventSportCitiesController],
  providers: [EventSportCitiesService],
})
export class EventSportCitiesModule {}
