import { Module } from '@nestjs/common';
import { EnvConfigModule } from './config/env.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { EventsModule } from './modules/events/events.module';

@Module({
  imports: [EnvConfigModule, PrismaModule, HealthModule, AuthModule, EventsModule],
})
export class AppModule {}
