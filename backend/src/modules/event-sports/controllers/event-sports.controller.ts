import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EventSportsService } from '../services/event-sports.service';
import { CreateEventSportDto } from '../dto/create-event-sport.dto';
import { UpdateEventSportDto } from '../dto/update-event-sport.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Event Sports')
@Controller('events/:eventId/sports')
export class EventSportsController {
  constructor(private readonly eventSportsService: EventSportsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar modalidades de um evento' })
  findAll(@Param('eventId') eventId: string) {
    return this.eventSportsService.findByEvent(eventId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vincular modalidade ao evento' })
  create(@Param('eventId') eventId: string, @Body() dto: CreateEventSportDto) {
    return this.eventSportsService.create(eventId, dto.sportId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar configuração da modalidade no evento' })
  update(@Param('id') id: string, @Body() dto: UpdateEventSportDto) {
    return this.eventSportsService.update(id, dto);
  }

  @Delete(':sportId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover modalidade do evento' })
  remove(@Param('eventId') eventId: string, @Param('sportId') sportId: string) {
    return this.eventSportsService.remove(eventId, sportId);
  }
}
