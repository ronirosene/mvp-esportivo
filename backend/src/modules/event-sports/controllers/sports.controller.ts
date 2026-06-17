import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Sports')
@Controller('sports')
export class SportsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as modalidades' })
  findAll() {
    return this.prisma.sport.findMany({ orderBy: { nome: 'asc' } });
  }
}
