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

@Module({
  imports: [EnvConfigModule, PrismaModule, HealthModule, AuthModule, EventsModule, EventSportsModule, CitiesModule, EventSportCitiesModule, GroupsModule, MatchesModule],
})
export class AppModule {}
