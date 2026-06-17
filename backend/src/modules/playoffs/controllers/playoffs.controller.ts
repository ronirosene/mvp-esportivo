import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PlayoffsService } from '../services/playoffs.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Playoffs')
@Controller('event-sports/:eventSportId/playoffs')
export class PlayoffsController {
  constructor(private readonly playoffsService: PlayoffsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar confrontos do mata-mata' })
  findAll(@Param('eventSportId') eventSportId: string) {
    return this.playoffsService.findByEventSport(eventSportId);
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gerar fase eliminatória' })
  generate(@Param('eventSportId') eventSportId: string) {
    return this.playoffsService.generate(eventSportId);
  }

  @Post('advance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Avançar para próxima fase' })
  advance(@Param('eventSportId') eventSportId: string) {
    return this.playoffsService.advance(eventSportId);
  }
}
