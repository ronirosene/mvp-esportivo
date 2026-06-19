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
  @ApiQuery({ name: 'orgSlug', required: false })
  findAll(@Query('search') search?: string, @Query('orgSlug') orgSlug?: string) {
    return this.service.findAll(search, orgSlug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes da cidade' })
  @ApiQuery({ name: 'orgSlug', required: false })
  findOne(@Param('id') id: string, @Query('orgSlug') orgSlug?: string) {
    return this.service.findOne(id, orgSlug);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Histórico da cidade agrupado por ano' })
  @ApiQuery({ name: 'orgSlug', required: false })
  history(@Param('id') id: string, @Query('orgSlug') orgSlug?: string) {
    return this.service.history(id, orgSlug);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Estatísticas agregadas da cidade' })
  @ApiQuery({ name: 'orgSlug', required: false })
  stats(@Param('id') id: string, @Query('orgSlug') orgSlug?: string) {
    return this.service.stats(id, orgSlug);
  }
}
