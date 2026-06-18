import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ChampionsController } from './champions.controller';
import { ChampionsService } from './champions.service';

@Module({
  imports: [PrismaModule],
  controllers: [ChampionsController],
  providers: [ChampionsService],
  exports: [ChampionsService],
})
export class ChampionsModule {}
