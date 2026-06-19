import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Public Live')
@Controller('public/live')
export class LiveController {
  private readonly logger = new Logger(LiveController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Retorna todas as partidas ao vivo (IN_PROGRESS)' })
  async getLiveMatches() {
    const matches = await this.prisma.match.findMany({
      where: { status: 'IN_PROGRESS' },
      include: {
        homeCity: { select: { id: true, nome: true, siglaEstado: true } },
        awayCity: { select: { id: true, nome: true, siglaEstado: true } },
        eventSport: {
          select: {
            id: true,
            displayName: true,
            event: { select: { id: true, nome: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return matches.map((m) => ({
      id: m.id,
      event: m.eventSport.event.nome,
      sport: m.eventSport.displayName,
      homeCity: m.homeCity.nome,
      awayCity: m.awayCity.nome,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      status: m.status,
      updatedAt: m.updatedAt,
    }));
  }
}
