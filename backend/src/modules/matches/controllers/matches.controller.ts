import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MatchesService } from '../services/matches.service';
import { UpdateMatchDto } from '../dto/update-match.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Matches')
@Controller()
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get('groups/:groupId/matches')
  @ApiOperation({ summary: 'Listar partidas de um grupo' })
  findByGroup(@Param('groupId') groupId: string) {
    return this.matchesService.findByGroup(groupId);
  }

  @Post('groups/:groupId/matches/generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gerar partidas automaticamente' })
  generate(@Param('groupId') groupId: string) {
    return this.matchesService.generate(groupId);
  }

  @Delete('groups/:groupId/matches')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir partidas de um grupo' })
  removeByGroup(@Param('groupId') groupId: string) {
    return this.matchesService.removeByGroup(groupId);
  }

  @Put('matches/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar partida' })
  update(@Param('id') id: string, @Body() dto: UpdateMatchDto) {
    return this.matchesService.update(id, dto);
  }
}
