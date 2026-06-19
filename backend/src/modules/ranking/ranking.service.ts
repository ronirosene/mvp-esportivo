import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface RankingFilters {
  eventId?: string;
  sportId?: string;
  year?: number;
  orgSlug?: string;
}

export interface RankingEntry {
  cityId: string;
  cityName: string;
  state: string;
  siglaEstado: string;
  titles: number;
  runnerUps: number;
  thirdPlaces: number;
  participations: number;
  score: number;
  position: number;
}

@Injectable()
export class RankingService {
  constructor(private readonly prisma: PrismaService) {}

  async getRanking(filters: RankingFilters): Promise<RankingEntry[]> {
    const championWhere: any = {};
    if (filters.eventId) championWhere.eventId = filters.eventId;
    if (filters.sportId) championWhere.eventSport = { sportId: filters.sportId };
    if (filters.year) championWhere.event = { ano: filters.year };
    if (filters.orgSlug) {
      championWhere.event = { ...(championWhere.event || {}), organization: { slug: filters.orgSlug } };
    }

    const champions = await this.prisma.champion.findMany({
      where: championWhere,
      include: { city: true },
    });

    let participationsMap = new Map<string, number>();

    if (filters.eventId) {
      const eventSportCities = await this.prisma.eventSportCity.findMany({
        where: { eventSport: { eventId: filters.eventId } },
        select: { cityId: true },
      });
      for (const esc of eventSportCities) {
        participationsMap.set(esc.cityId, (participationsMap.get(esc.cityId) || 0) + 1);
      }
    } else {
      const participationWhere: any = {};
      if (filters.orgSlug) {
        participationWhere.eventSport = { event: { organization: { slug: filters.orgSlug } } };
      }
      const participationsByCity = await this.prisma.eventSportCity.groupBy({
        by: ['cityId'],
        where: participationWhere,
        _count: true,
      });
      participationsMap = new Map(participationsByCity.map((p) => [p.cityId, p._count]));
    }

    const cityMap = new Map<string, { titles: number; runnerUps: number; thirdPlaces: number; cityName: string; state: string; siglaEstado: string }>();

    for (const ch of champions) {
      if (!cityMap.has(ch.cityId)) {
        cityMap.set(ch.cityId, { titles: 0, runnerUps: 0, thirdPlaces: 0, cityName: ch.city.nome, state: ch.city.estado, siglaEstado: ch.city.siglaEstado });
      }
      const entry = cityMap.get(ch.cityId)!;
      if (ch.position === 'CHAMPION') entry.titles++;
      else if (ch.position === 'RUNNER_UP') entry.runnerUps++;
      else if (ch.position === 'THIRD_PLACE') entry.thirdPlaces++;
    }

    const result: RankingEntry[] = Array.from(cityMap.entries()).map(([cityId, data]) => ({
      cityId,
      cityName: data.cityName,
      state: data.state,
      siglaEstado: data.siglaEstado,
      titles: data.titles,
      runnerUps: data.runnerUps,
      thirdPlaces: data.thirdPlaces,
      participations: participationsMap.get(cityId) || 0,
      score: data.titles * 5 + data.runnerUps * 3 + data.thirdPlaces * 1,
      position: 0,
    }));

    result.sort((a, b) => b.score - a.score || b.titles - a.titles || a.cityName.localeCompare(b.cityName));
    result.forEach((entry, index) => { entry.position = index + 1; });

    return result;
  }
}
