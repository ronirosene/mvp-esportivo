import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ChampionsService } from './champions.service';

@ApiTags('Histórico de Campeões')
@Controller('public/champions')
export class ChampionsController {
  constructor(private readonly service: ChampionsService) {}

  @Get()
  @ApiOperation({ summary: 'Histórico geral de campeões' })
  @ApiQuery({ name: 'orgSlug', required: false })
  findAll(@Query('orgSlug') orgSlug?: string) {
    return this.service.findAll(orgSlug);
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
  @ApiQuery({ name: 'orgSlug', required: false })
  findByCity(@Param('cityId') cityId: string, @Query('orgSlug') orgSlug?: string) {
    return this.service.findByCity(cityId, orgSlug);
  }

  @Get('city/:cityId/stats')
  @ApiOperation({ summary: 'Estatísticas de uma cidade' })
  @ApiQuery({ name: 'orgSlug', required: false })
  cityStats(@Param('cityId') cityId: string, @Query('orgSlug') orgSlug?: string) {
    return this.service.cityStats(cityId, orgSlug);
  }
}
