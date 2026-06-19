import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChampionsService {
  constructor(private readonly prisma: PrismaService) {}

  async handleFinishedMatch(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { eventSport: true },
    });
    if (!match) return;
    if (match.status !== 'FINISHED') return;
    if (match.homeScore === null || match.awayScore === null) return;

    if (match.fase === 'FINAL') {
      const winnerId = match.homeScore > match.awayScore ? match.homeCityId : match.awayCityId;
      const loserId = match.homeScore > match.awayScore ? match.awayCityId : match.homeCityId;

      await this.prisma.$transaction([
        this.prisma.champion.upsert({
          where: { eventSportId_position: { eventSportId: match.eventSportId, position: 'CHAMPION' } },
          create: { eventId: match.eventSport.eventId, eventSportId: match.eventSportId, cityId: winnerId, position: 'CHAMPION' },
          update: { cityId: winnerId },
        }),
        this.prisma.champion.upsert({
          where: { eventSportId_position: { eventSportId: match.eventSportId, position: 'RUNNER_UP' } },
          create: { eventId: match.eventSport.eventId, eventSportId: match.eventSportId, cityId: loserId, position: 'RUNNER_UP' },
          update: { cityId: loserId },
        }),
      ]);
    }

    if (match.fase === 'TERCEIRO_LUGAR') {
      const winnerId = match.homeScore > match.awayScore ? match.homeCityId : match.awayCityId;
      await this.prisma.champion.upsert({
        where: { eventSportId_position: { eventSportId: match.eventSportId, position: 'THIRD_PLACE' } },
        create: { eventId: match.eventSport.eventId, eventSportId: match.eventSportId, cityId: winnerId, position: 'THIRD_PLACE' },
        update: { cityId: winnerId },
      });
    }
  }

  async findAll(orgSlug?: string) {
    const where: any = {};
    if (orgSlug) {
      where.event = { organization: { slug: orgSlug } };
    }
    return this.prisma.champion.findMany({
      where,
      include: {
        event: { select: { id: true, nome: true, ano: true } },
        eventSport: { select: { id: true, displayName: true } },
        city: { select: { id: true, nome: true, siglaEstado: true } },
      },
      orderBy: [{ event: { ano: 'desc' } }, { eventSport: { displayName: 'asc' } }, { position: 'asc' }],
    });
  }

  async findByEvent(eventId: string) {
    return this.prisma.champion.findMany({
      where: { eventId },
      include: {
        event: { select: { id: true, nome: true, ano: true } },
        eventSport: { select: { id: true, displayName: true } },
        city: { select: { id: true, nome: true, siglaEstado: true } },
      },
      orderBy: [{ eventSport: { displayName: 'asc' } }, { position: 'asc' }],
    });
  }

  async findByEventSport(eventSportId: string) {
    return this.prisma.champion.findMany({
      where: { eventSportId },
      include: {
        event: { select: { id: true, nome: true, ano: true } },
        eventSport: { select: { id: true, displayName: true } },
        city: { select: { id: true, nome: true, siglaEstado: true } },
      },
      orderBy: [{ position: 'asc' }],
    });
  }

  async findByCity(cityId: string, orgSlug?: string) {
    const where: any = { cityId };
    if (orgSlug) {
      where.event = { organization: { slug: orgSlug } };
    }
    return this.prisma.champion.findMany({
      where,
      include: {
        event: { select: { id: true, nome: true, ano: true } },
        eventSport: { select: { id: true, displayName: true } },
        city: { select: { id: true, nome: true, siglaEstado: true } },
      },
      orderBy: [{ event: { ano: 'desc' } }, { eventSport: { displayName: 'asc' } }],
    });
  }

  async cityStats(cityId: string, orgSlug?: string) {
    const where: any = { cityId };
    if (orgSlug) {
      where.event = { organization: { slug: orgSlug } };
    }
    const champions = await this.prisma.champion.findMany({ where });
    return {
      totalTitulos: champions.filter((c) => c.position === 'CHAMPION').length,
      totalVices: champions.filter((c) => c.position === 'RUNNER_UP').length,
      totalTerceiros: champions.filter((c) => c.position === 'THIRD_PLACE').length,
    };
  }
}
