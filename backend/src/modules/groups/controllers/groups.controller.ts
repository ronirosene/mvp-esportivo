import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GroupsService } from '../services/groups.service';
import { GenerateGroupsDto } from '../dto/generate-groups.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Groups')
@Controller('event-sports/:eventSportId/groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar grupos de uma modalidade' })
  findAll(@Param('eventSportId') eventSportId: string) {
    return this.groupsService.findByEventSport(eventSportId);
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gerar grupos automaticamente' })
  generate(@Param('eventSportId') eventSportId: string, @Body() dto: GenerateGroupsDto) {
    return this.groupsService.generate(eventSportId, dto.groupCount);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover todos os grupos de uma modalidade' })
  remove(@Param('eventSportId') eventSportId: string) {
    return this.groupsService.removeAll(eventSportId);
  }
}
