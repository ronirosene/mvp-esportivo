import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Sports')
@Controller('sports')
export class SportsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as modalidades (catálogo global)' })
  findAll() {
    return this.prisma.sport.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter modalidade por ID' })
  findOne(@Param('id') id: string) {
    return this.prisma.sport.findUnique({ where: { id } });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar modalidade no catálogo global' })
  create(@Body() body: { nome: string }) {
    return this.prisma.sport.create({ data: { nome: body.nome } });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar modalidade' })
  update(@Param('id') id: string, @Body() body: { nome?: string; ativo?: boolean }) {
    return this.prisma.sport.update({ where: { id }, data: body });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Desativar modalidade (soft delete)' })
  remove(@Param('id') id: string) {
    return this.prisma.sport.update({ where: { id }, data: { ativo: false } });
  }
}
