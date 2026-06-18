import { Module } from '@nestjs/common';
import { EnvConfigModule } from './config/env.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { EventsModule } from './modules/events/events.module';
import { EventSportsModule } from './modules/event-sports/event-sports.module';
import { CitiesModule } from './modules/cities/cities.module';
import { EventSportCitiesModule } from './modules/event-sport-cities/event-sport-cities.module';
import { GroupsModule } from './modules/groups/groups.module';
import { MatchesModule } from './modules/matches/matches.module';
import { StandingsModule } from './modules/standings/standings.module';
import { PlayoffsModule } from './modules/playoffs/playoffs.module';
import { CompetitionFormatsModule } from './modules/competition-formats/competition-formats.module';
import { PublicScheduleModule } from './modules/public-schedule/public-schedule.module';
import { ChampionsModule } from './modules/champions/champions.module';
import { CityHistoryModule } from './modules/city-history/city-history.module';
import { RankingModule } from './modules/ranking/ranking.module';

@Module({
  imports: [EnvConfigModule, PrismaModule, HealthModule, AuthModule, EventsModule, EventSportsModule, CitiesModule, EventSportCitiesModule, GroupsModule, MatchesModule, StandingsModule, PlayoffsModule, CompetitionFormatsModule, PublicScheduleModule, ChampionsModule, CityHistoryModule, RankingModule],
})
export class AppModule {}
