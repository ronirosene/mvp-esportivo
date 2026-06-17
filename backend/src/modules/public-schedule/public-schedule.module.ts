import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PublicScheduleController } from './public-schedule.controller';
import { PublicScheduleService } from './public-schedule.service';

@Module({
  imports: [PrismaModule],
  controllers: [PublicScheduleController],
  providers: [PublicScheduleService],
})
export class PublicScheduleModule {}
