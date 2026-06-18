import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ChampionsService } from './champions.service';

@ApiTags('Histórico de Campeões')
@Controller('public/champions')
export class ChampionsController {
  constructor(private readonly service: ChampionsService) {}

  @Get()
  @ApiOperation({ summary: 'Histórico geral de campeões' })
  findAll() {
    return this.service.findAll();
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Histórico de um evento' })
  findByEvent(@Param('eventId') eventId: string) {
    return this.service.findByEvent(eventId);
  }

  @Get('sport/:eventSportId')
  @ApiOperation({ summary: 'Histórico de uma modalidade' })
  findByEventSport(@Param('eventSportId') eventSportId: string) {
    return this.service.findByEventSport(eventSportId);
  }

  @Get('city/:cityId')
  @ApiOperation({ summary: 'Histórico de uma cidade' })
  findByCity(@Param('cityId') cityId: string) {
    return this.service.findByCity(cityId);
  }

  @Get('city/:cityId/stats')
  @ApiOperation({ summary: 'Estatísticas de uma cidade' })
  cityStats(@Param('cityId') cityId: string) {
    return this.service.cityStats(cityId);
  }
}
