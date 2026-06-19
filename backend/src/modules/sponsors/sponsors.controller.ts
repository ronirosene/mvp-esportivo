import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SponsorsService } from './sponsors.service';
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Sponsors')
@Controller()
export class SponsorsController {
  constructor(private readonly service: SponsorsService) {}

  @Post('sponsors')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar patrocinador' })
  create(@Body() dto: CreateSponsorDto) {
    return this.service.create(dto);
  }

  @Get('sponsors')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar patrocinadores (admin)' })
  findAll(@Query('orgSlug') orgSlug?: string) {
    return this.service.findAll(orgSlug);
  }

  @Get('sponsors/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter patrocinador' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put('sponsors/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar patrocinador' })
  update(@Param('id') id: string, @Body() dto: UpdateSponsorDto) {
    return this.service.update(id, dto);
  }

  @Delete('sponsors/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir patrocinador' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Get('public/sponsors')
  @ApiOperation({ summary: 'Listar patrocinadores ativos (público)' })
  findPublic(@Query('orgSlug') orgSlug?: string) {
    return this.service.findPublic(orgSlug);
  }

  @Post('public/sponsors/:id/view')
  @ApiOperation({ summary: 'Registrar visualização' })
  registerView(@Param('id') id: string) {
    return this.service.registerView(id);
  }

  @Post('public/sponsors/:id/click')
  @ApiOperation({ summary: 'Registrar clique' })
  registerClick(@Param('id') id: string) {
    return this.service.registerClick(id);
  }
}
