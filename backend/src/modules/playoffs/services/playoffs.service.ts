import { Injectable, NotFoundException, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Fase } from '@prisma/client';
import { LiveService } from '../../live/live.service';

@Injectable()
export class PlayoffsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly liveService: LiveService,
  ) {}

  private checkDb() {
    if (!this.prisma.isConnected) {
      throw new ServiceUnavailableException('Banco de dados indispon\u00edvel');
    }
  }

  async findByEventSport(eventSportId: string) {
    this.checkDb();
    return this.prisma.match.findMany({
      where: { eventSportId, fase: { not: 'GRUPOS' } },
      include: { homeCity: true, awayCity: true },
      orderBy: [{ round: 'asc' as const }, { displayOrder: 'asc' as const }, { createdAt: 'asc' as const }],
    });
  }

  private async getFormat(eventSportId: string) {
    let fmt = await this.prisma.competitionFormat.findUnique({ where: { eventSportId } });
    if (!fmt) {
      const es = await this.prisma.eventSport.findUnique({ where: { id: eventSportId } });
      if (!es) throw new NotFoundException('Modalidade n\u00e3o encontrada');
      fmt = await this.prisma.competitionFormat.create({
        data: {
          eventSportId,
          qualifiedPerGroup: es.classificationCount,
          thirdPlaceMatch: es.generateThirdPlace,
          manualBracket: es.drawMode === 'MANUAL',
        },
      });
    }
    return fmt;
  }

  async generate(eventSportId: string) {
    this.checkDb();
    const fmt = await this.getFormat(eventSportId);

    const groups = await this.prisma.group.findMany({
      where: { eventSportId },
      include: {
        standings: {
          include: { city: true },
          orderBy: { position: 'asc' as const },
        },
      },
      orderBy: { nome: 'asc' as const },
    });

    if (groups.length < 2) {
      throw new BadRequestException('M\u00ednimo de 2 grupos para gerar mata-mata.');
    }

    const firsts: { cityId: string }[] = [];
    const seconds: { cityId: string }[] = [];

    for (const group of groups) {
      const top = group.standings.slice(0, fmt.qualifiedPerGroup);
      if (top.length < fmt.qualifiedPerGroup) {
        throw new BadRequestException(`Grupo ${group.nome} n\u00e3o possui classifica\u00e7\u00e3o completa.`);
      }
      firsts.push({ cityId: top[0].cityId });
      if (top.length > 1) {
        seconds.push({ cityId: top[1].cityId });
      }
    }

    await this.prisma.match.deleteMany({
      where: { eventSportId, fase: { not: 'GRUPOS' } },
    });

    const groupCount = groups.length;
    const firstPhase: Fase = groupCount > 2 ? 'QUARTAS' : 'SEMIFINAL';

    for (let i = 0; i < groupCount; i++) {
      const home = firsts[i];
      const away = seconds[groupCount - 1 - i];
      await this.prisma.match.create({
        data: {
          eventSportId,
          homeCityId: home.cityId,
          awayCityId: away.cityId,
          status: 'SCHEDULED',
          fase: firstPhase,
          round: 1,
          displayOrder: i + 1,
        },
      });
    }

    const bracket = await this.getBracket(eventSportId);
    this.liveService.emitPlayoffsUpdated(eventSportId, bracket);
    return bracket;
  }

  async advance(eventSportId: string) {
    this.checkDb();
    const fmt = await this.getFormat(eventSportId);

    const matches = await this.prisma.match.findMany({
      where: { eventSportId, fase: { not: 'GRUPOS' } },
      orderBy: [{ round: 'asc' as const }, { displayOrder: 'asc' as const }],
    });

    if (matches.length === 0) {
      throw new BadRequestException('Nenhum confronto de mata-mata encontrado.');
    }

    const hasQuartas = matches.some((m) => m.fase === 'QUARTAS');
    const hasSemi = matches.some((m) => m.fase === 'SEMIFINAL');
    const hasFinal = matches.some((m) => m.fase === 'FINAL');

    if (hasQuartas) {
      const quartasMatches = matches.filter((m) => m.fase === 'QUARTAS');
      if (quartasMatches.length === 0) return this.findByEventSport(eventSportId);

      const allDone = quartasMatches.every((m) => m.status === 'FINISHED');
      if (!allDone) {
        throw new BadRequestException('Nem todas as quartas de final foram finalizadas.');
      }

      await this.prisma.match.deleteMany({
        where: { eventSportId, fase: 'SEMIFINAL' },
      });

      const semiCount = quartasMatches.length / 2;
      for (let i = 0; i < semiCount; i++) {
        const m1 = quartasMatches[i * 2];
        const m2 = quartasMatches[i * 2 + 1];
        const w1 = m1.homeScore! > m1.awayScore! ? m1.homeCityId : m1.awayCityId;
        const w2 = m2.homeScore! > m2.awayScore! ? m2.homeCityId : m2.awayCityId;

        await this.prisma.match.create({
          data: {
            eventSportId,
            homeCityId: w1,
            awayCityId: w2,
            status: 'SCHEDULED',
            fase: 'SEMIFINAL',
            round: 2,
            displayOrder: i + 1,
          },
        });
      }
    } else if (hasSemi && !hasFinal) {
      const semiMatches = matches.filter((m) => m.fase === 'SEMIFINAL');
      if (semiMatches.length === 0) return this.findByEventSport(eventSportId);

      const allDone = semiMatches.every((m) => m.status === 'FINISHED');
      if (!allDone) {
        throw new BadRequestException('Nem todas as semifinais foram finalizadas.');
      }

      await this.prisma.match.deleteMany({
        where: { eventSportId, fase: { in: ['FINAL', 'TERCEIRO_LUGAR'] } },
      });

      const winners: string[] = [];
      const losers: string[] = [];
      for (const m of semiMatches) {
        if (m.homeScore! > m.awayScore!) {
          winners.push(m.homeCityId);
          losers.push(m.awayCityId);
        } else {
          winners.push(m.awayCityId);
          losers.push(m.homeCityId);
        }
      }

      await this.prisma.match.create({
        data: {
          eventSportId,
          homeCityId: winners[0],
          awayCityId: winners[1],
          status: 'SCHEDULED',
          fase: 'FINAL',
          round: 3,
          displayOrder: 1,
        },
      });

      if (fmt.thirdPlaceMatch) {
        await this.prisma.match.create({
          data: {
            eventSportId,
            homeCityId: losers[0],
            awayCityId: losers[1],
            status: 'SCHEDULED',
            fase: 'TERCEIRO_LUGAR',
            round: 3,
            displayOrder: 2,
          },
        });
      }
    } else {
      throw new BadRequestException('N\u00e3o h\u00e1 fase para avan\u00e7ar.');
    }

    const bracket = await this.getBracket(eventSportId);
    this.liveService.emitPlayoffsUpdated(eventSportId, bracket);
    return bracket;
  }

  async getBracket(eventSportId: string) {
    this.checkDb();
    const matches = await this.prisma.match.findMany({
      where: { eventSportId, fase: { not: 'GRUPOS' } },
      include: { homeCity: true, awayCity: true },
      orderBy: [{ round: 'asc' as const }, { displayOrder: 'asc' as const }, { createdAt: 'asc' as const }],
    });
    return {
      quarters: matches.filter((m) => m.fase === 'QUARTAS'),
      semifinals: matches.filter((m) => m.fase === 'SEMIFINAL'),
      final: matches.find((m) => m.fase === 'FINAL') || null,
      thirdPlace: matches.find((m) => m.fase === 'TERCEIRO_LUGAR') || null,
    };
  }
}
