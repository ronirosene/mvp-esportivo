import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CityHistoryService } from './city-history.service';

@ApiTags('Cidades (Público)')
@Controller('public/cities')
export class CityHistoryController {
  constructor(private readonly service: CityHistoryService) {}

  @Get()
  @ApiOperation({ summary: 'Listar cidades (público)' })
  @ApiQuery({ name: 'search', required: false })
  findAll(@Query('search') search?: string) {
    return this.service.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes da cidade' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Histórico da cidade agrupado por ano' })
  history(@Param('id') id: string) {
    return this.service.history(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Estatísticas agregadas da cidade' })
  stats(@Param('id') id: string) {
    return this.service.stats(id);
  }
}
