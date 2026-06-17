import { Module } from '@nestjs/common';
import { CitiesController } from './controllers/cities.controller';
import { CitiesService } from './services/cities.service';

@Module({
  controllers: [CitiesController],
  providers: [CitiesService],
})
export class CitiesModule {}
