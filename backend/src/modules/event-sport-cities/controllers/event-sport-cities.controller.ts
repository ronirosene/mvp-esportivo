import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EventSportCitiesService } from '../services/event-sport-cities.service';
import { CreateEventSportCityDto, BulkCreateEventSportCityDto } from '../dto/create-event-sport-city.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Event Sport Cities')
@Controller('event-sports/:eventSportId/cities')
export class EventSportCitiesController {
  constructor(private readonly eventSportCitiesService: EventSportCitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar cidades inscritas em uma modalidade' })
  findAll(@Param('eventSportId') eventSportId: string) {
    return this.eventSportCitiesService.findByEventSport(eventSportId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Inscrever cidade em modalidade' })
  create(@Param('eventSportId') eventSportId: string, @Body() dto: CreateEventSportCityDto) {
    return this.eventSportCitiesService.create(eventSportId, dto.cityId);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Inscrever múltiplas cidades em uma modalidade' })
  createBulk(@Param('eventSportId') eventSportId: string, @Body() dto: BulkCreateEventSportCityDto) {
    return this.eventSportCitiesService.createBulk(eventSportId, dto.cityIds);
  }

  @Delete(':cityId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover cidade de modalidade' })
  remove(@Param('eventSportId') eventSportId: string, @Param('cityId') cityId: string) {
    return this.eventSportCitiesService.remove(eventSportId, cityId);
  }
}
