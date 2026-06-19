import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EventsService } from '../services/events.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar evento' })
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar eventos' })
  @ApiQuery({ name: 'nome', required: false })
  @ApiQuery({ name: 'ano', required: false })
  @ApiQuery({ name: 'orgSlug', required: false })
  findAll(@Query('nome') nome?: string, @Query('ano') ano?: string, @Query('orgSlug') orgSlug?: string) {
    return this.eventsService.findAll(nome, ano ? Number(ano) : undefined, orgSlug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter evento por ID' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar evento' })
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir evento' })
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
