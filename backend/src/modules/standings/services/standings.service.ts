import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StandingsService {
  constructor(private readonly prisma: PrismaService) {}

  private checkDb() {
    if (!this.prisma.isConnected) {
      throw new ServiceUnavailableException('Banco de dados indisponível');
    }
  }

  async getGroupStanding(groupId: string) {
    this.checkDb();
    return this.prisma.groupStanding.findMany({
      where: { groupId },
      include: { city: true },
      orderBy: { position: 'asc' },
    });
  }

  async recalculateGroup(groupId: string) {
    this.checkDb();

    const matches = await this.prisma.match.findMany({
      where: { groupId, status: 'FINISHED' },
    });

    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        groupParticipants: {
          include: { eventSportCity: { include: { city: true } } },
        },
      },
    });
    if (!group) return [];

    const statsMap = new Map<string, {
      played: number; wins: number; draws: number; losses: number;
      goalsFor: number; goalsAgainst: number;
    }>();

    for (const gp of group.groupParticipants) {
      const cityId = gp.eventSportCity.cityId;
      statsMap.set(cityId, { played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 });
    }

    for (const m of matches) {
      if (m.homeScore === null || m.awayScore === null) continue;

      const home = statsMap.get(m.homeCityId);
      const away = statsMap.get(m.awayCityId);
      if (!home || !away) continue;

      home.played++;
      away.played++;
      home.goalsFor += m.homeScore;
      home.goalsAgainst += m.awayScore;
      away.goalsFor += m.awayScore;
      away.goalsAgainst += m.homeScore;

      if (m.homeScore > m.awayScore) {
        home.wins++;
        away.losses++;
      } else if (m.homeScore < m.awayScore) {
        away.wins++;
        home.losses++;
      } else {
        home.draws++;
        away.draws++;
      }
    }

    const standings = Array.from(statsMap.entries()).map(([cityId, s]) => ({
      cityId,
      played: s.played,
      wins: s.wins,
      draws: s.draws,
      losses: s.losses,
      goalsFor: s.goalsFor,
      goalsAgainst: s.goalsAgainst,
      goalDifference: s.goalsFor - s.goalsAgainst,
      points: s.wins * 3 + s.draws,
    }));

    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      if (a.goalsAgainst !== b.goalsAgainst) return a.goalsAgainst - b.goalsAgainst;
      return 0;
    });

    await this.prisma.groupStanding.deleteMany({ where: { groupId } });

    const created = [];
    for (let i = 0; i < standings.length; i++) {
      const s = standings[i];
      const record = await this.prisma.groupStanding.create({
        data: {
          groupId,
          cityId: s.cityId,
          position: i + 1,
          played: s.played,
          wins: s.wins,
          draws: s.draws,
          losses: s.losses,
          goalsFor: s.goalsFor,
          goalsAgainst: s.goalsAgainst,
          goalDifference: s.goalDifference,
          points: s.points,
        },
        include: { city: true },
      });
      created.push(record);
    }

    return created;
  }

  async recalculateFromMatch(matchId: string) {
    this.checkDb();
    const match = await this.prisma.match.findUnique({ where: { id: matchId } });
    if (!match) return;
    await this.recalculateGroup(match.groupId);
  }
}
