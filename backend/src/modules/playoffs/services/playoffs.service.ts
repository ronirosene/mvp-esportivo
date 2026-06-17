import { Injectable, NotFoundException, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Fase } from '@prisma/client';

@Injectable()
export class PlayoffsService {
  constructor(private readonly prisma: PrismaService) {}

  private checkDb() {
    if (!this.prisma.isConnected) {
      throw new ServiceUnavailableException('Banco de dados indisponível');
    }
  }

  async findByEventSport(eventSportId: string) {
    this.checkDb();
    return this.prisma.match.findMany({
      where: { eventSportId, fase: { not: 'GRUPOS' } },
      include: { homeCity: true, awayCity: true },
      orderBy: [{ fase: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async generate(eventSportId: string) {
    this.checkDb();
    const es = await this.prisma.eventSport.findUnique({ where: { id: eventSportId } });
    if (!es) throw new NotFoundException('Modalidade não encontrada');

    const groups = await this.prisma.group.findMany({
      where: { eventSportId },
      include: {
        standings: {
          include: { city: true },
          orderBy: { position: 'asc' },
          take: es.classificationCount,
        },
      },
      orderBy: { nome: 'asc' },
    });

    if (groups.length < 2) {
      throw new BadRequestException('Mínimo de 2 grupos para gerar mata-mata.');
    }

    const qualified: { cityId: string; groupIndex: number; position: number }[] = [];
    for (const group of groups) {
      const top = group.standings.slice(0, es.classificationCount);
      if (top.length < es.classificationCount) {
        throw new BadRequestException(`Grupo ${group.nome} não possui classificação completa.`);
      }
      for (const s of top) {
        qualified.push({ cityId: s.cityId, groupIndex: groups.indexOf(group), position: s.position });
      }
    }

    await this.prisma.match.deleteMany({
      where: { eventSportId, fase: { not: 'GRUPOS' } },
    });

    const groupCount = groups.length;
    const perGroup = es.classificationCount;
    const firsts = qualified.filter((q) => q.position === 1);
    const seconds = qualified.filter((q) => q.position === 2);

    const firstPhase = qualified.length <= 4 ? 'SEMIFINAL' as Fase : 'QUARTAS' as Fase;

    for (let i = 0; i < groupCount; i++) {
      const homeTeam = firsts[i];
      const awayTeam = seconds[groupCount - 1 - i];
      await this.prisma.match.create({
        data: {
          eventSportId,
          homeCityId: homeTeam.cityId,
          awayCityId: awayTeam.cityId,
          status: 'SCHEDULED',
          fase: firstPhase,
        },
      });
    }

    return this.findByEventSport(eventSportId);
  }

  async advance(eventSportId: string) {
    this.checkDb();
    const es = await this.prisma.eventSport.findUnique({ where: { id: eventSportId } });
    if (!es) throw new NotFoundException('Modalidade não encontrada');

    const phases: Fase[] = ['QUARTAS', 'SEMIFINAL'];
    let currentPhase: Fase | null = null;

    for (const fase of phases) {
      const matches = await this.prisma.match.findMany({
        where: { eventSportId, fase },
      });
      if (matches.length > 0) {
        currentPhase = fase;
        break;
      }
    }

    const semis = await this.prisma.match.findMany({
      where: { eventSportId, fase: 'SEMIFINAL' },
    });

    if (semis.length > 0 && semis.every((m) => m.status === 'FINISHED' && m.homeScore !== null && m.awayScore !== null)) {
      await this.prisma.match.deleteMany({
        where: { eventSportId, fase: { in: ['FINAL', 'TERCEIRO_LUGAR'] } },
      });

      const winners: string[] = [];
      const losers: string[] = [];
      for (const m of semis) {
        if (m.homeScore! > m.awayScore!) {
          winners.push(m.homeCityId);
          losers.push(m.awayCityId);
        } else {
          winners.push(m.awayCityId);
          losers.push(m.homeCityId);
        }
      }

      await this.prisma.match.create({
        data: { eventSportId, homeCityId: winners[0], awayCityId: winners[1], status: 'SCHEDULED', fase: 'FINAL' },
      });

      if (es.generateThirdPlace) {
        await this.prisma.match.create({
          data: { eventSportId, homeCityId: losers[0], awayCityId: losers[1], status: 'SCHEDULED', fase: 'TERCEIRO_LUGAR' },
        });
      }

      return this.findByEventSport(eventSportId);
    }

    return this.findByEventSport(eventSportId);
  }
}
