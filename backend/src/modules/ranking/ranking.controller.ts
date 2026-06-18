import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RankingService } from './ranking.service';

@ApiTags('Ranking (Público)')
@Controller('public/ranking')
export class RankingController {
  constructor(private readonly service: RankingService) {}

  @Get()
  @ApiOperation({ summary: 'Ranking histórico das cidades' })
  @ApiQuery({ name: 'eventId', required: false })
  @ApiQuery({ name: 'sportId', required: false })
  @ApiQuery({ name: 'year', required: false })
  getRanking(
    @Query('eventId') eventId?: string,
    @Query('sportId') sportId?: string,
    @Query('year') year?: string,
  ) {
    return this.service.getRanking({
      eventId,
      sportId,
      year: year ? parseInt(year, 10) : undefined,
    });
  }
}
