import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StandingsService } from '../services/standings.service';

@ApiTags('Standings')
@Controller('groups/:groupId/standings')
export class StandingsController {
  constructor(private readonly standingsService: StandingsService) {}

  @Get()
  @ApiOperation({ summary: 'Obter classificação do grupo' })
  get(@Param('groupId') groupId: string) {
    return this.standingsService.getGroupStanding(groupId);
  }
}
