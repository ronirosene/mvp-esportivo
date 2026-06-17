import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PublicScheduleService } from './public-schedule.service';

@ApiTags('Agenda Pública')
@Controller('public/schedule')
export class PublicScheduleController {
  constructor(private readonly service: PublicScheduleService) {}

  @Get('today')
  @ApiOperation({ summary: 'Jogos de hoje' })
  today() {
    return this.service.today();
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Próximos jogos (7 dias)' })
  upcoming() {
    return this.service.upcoming();
  }

  @Get('results')
  @ApiOperation({ summary: 'Últimos resultados (7 dias)' })
  results() {
    return this.service.results();
  }

  @Get()
  @ApiOperation({ summary: 'Agenda com filtros' })
  @ApiQuery({ name: 'cityId', required: false })
  @ApiQuery({ name: 'sportId', required: false })
  @ApiQuery({ name: 'eventId', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('cityId') cityId?: string,
    @Query('sportId') sportId?: string,
    @Query('eventId') eventId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('location') location?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll({ cityId, sportId, eventId, dateFrom, dateTo, location, status, search });
  }
}
