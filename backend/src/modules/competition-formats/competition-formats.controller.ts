import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompetitionFormatsService } from './competition-formats.service';
import { UpsertCompetitionFormatDto } from './dto/upsert-competition-format.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Competition Formats')
@Controller('event-sports/:eventSportId/format')
export class CompetitionFormatsController {
  constructor(private readonly service: CompetitionFormatsService) {}

  @Get()
  @ApiOperation({ summary: 'Obter formato da modalidade' })
  find(@Param('eventSportId') eventSportId: string) {
    return this.service.findByEventSport(eventSportId);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar formato da modalidade' })
  upsert(@Param('eventSportId') eventSportId: string, @Body() dto: UpsertCompetitionFormatDto) {
    return this.service.upsert(eventSportId, dto);
  }
}
