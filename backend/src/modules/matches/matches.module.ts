import { Module } from '@nestjs/common';
import { MatchesController } from './controllers/matches.controller';
import { MatchesService } from './services/matches.service';
import { ChampionsModule } from '../champions/champions.module';

@Module({
  imports: [ChampionsModule],
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule {}
