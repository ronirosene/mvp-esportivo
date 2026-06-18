import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CityHistoryController } from './city-history.controller';
import { CityHistoryService } from './city-history.service';

@Module({
  imports: [PrismaModule],
  controllers: [CityHistoryController],
  providers: [CityHistoryService],
})
export class CityHistoryModule {}
