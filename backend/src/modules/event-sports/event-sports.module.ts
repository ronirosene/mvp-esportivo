import { Module } from '@nestjs/common';
import { EventSportsController } from './controllers/event-sports.controller';
import { SportsController } from './controllers/sports.controller';
import { EventSportsService } from './services/event-sports.service';

@Module({
  controllers: [EventSportsController, SportsController],
  providers: [EventSportsService],
})
export class EventSportsModule {}
