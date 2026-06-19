import { Module } from '@nestjs/common';
import { CityPortalController } from './city-portal.controller';
import { CityPortalService } from './city-portal.service';

@Module({
  controllers: [CityPortalController],
  providers: [CityPortalService],
})
export class CityPortalModule {}
