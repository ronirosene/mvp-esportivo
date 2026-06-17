import { Module } from '@nestjs/common';
import { PlayoffsController } from './controllers/playoffs.controller';
import { PlayoffsService } from './services/playoffs.service';

@Module({
  controllers: [PlayoffsController],
  providers: [PlayoffsService],
})
export class PlayoffsModule {}
