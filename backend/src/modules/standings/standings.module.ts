import { Global, Module } from '@nestjs/common';
import { StandingsController } from './controllers/standings.controller';
import { StandingsService } from './services/standings.service';

@Global()
@Module({
  controllers: [StandingsController],
  providers: [StandingsService],
  exports: [StandingsService],
})
export class StandingsModule {}
