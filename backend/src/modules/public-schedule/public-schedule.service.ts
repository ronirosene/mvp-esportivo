import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface ScheduleFilter {
  cityId?: string;
  sportId?: string;
  eventId?: string;
  dateFrom?: string;
  dateTo?: string;
  location?: string;
  status?: string;
  search?: string;
  orgSlug?: string;
}

@Injectable()
export class PublicScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  private include = {
    homeCity: true,
    awayCity: true,
    eventSport: {
      include: {
        sport: true,
        event: true,
      },
    },
  };

  private orderBy = [
    { matchDate: 'asc' as const },
    { createdAt: 'asc' as const },
  ];

  async today(orgSlug?: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const where: any = { matchDate: { gte: start, lt: end } };
    if (orgSlug) {
      where.eventSport = { event: { organization: { slug: orgSlug } } };
    }

    return this.prisma.match.findMany({
      where,
      include: this.include,
      orderBy: this.orderBy,
    });
  }

  async upcoming(orgSlug?: string) {
    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + 7);

    const where: any = { matchDate: { gte: now, lte: end }, status: { not: 'FINISHED' } };
    if (orgSlug) {
      where.eventSport = { event: { organization: { slug: orgSlug } } };
    }

    return this.prisma.match.findMany({
      where,
      include: this.include,
      orderBy: this.orderBy,
    });
  }

  async results(orgSlug?: string) {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - 7);

    const where: any = { matchDate: { gte: start, lte: end }, status: 'FINISHED' };
    if (orgSlug) {
      where.eventSport = { event: { organization: { slug: orgSlug } } };
    }

    return this.prisma.match.findMany({
      where,
      include: this.include,
      orderBy: [{ matchDate: 'desc' as const }, { createdAt: 'desc' as const }],
    });
  }

  async findAll(filters: ScheduleFilter) {
    const where: any = {};

    if (filters.cityId) {
      where.OR = [
        { homeCityId: filters.cityId },
        { awayCityId: filters.cityId },
      ];
    }

    if (filters.sportId) {
      where.eventSport = { ...(where.eventSport || {}), sportId: filters.sportId };
    }

    if (filters.eventId) {
      where.eventSport = { ...(where.eventSport || {}), eventId: filters.eventId };
    }

    if (filters.orgSlug) {
      where.eventSport = { ...(where.eventSport || {}), event: { organization: { slug: filters.orgSlug } } };
    }

    if (filters.dateFrom || filters.dateTo) {
      where.matchDate = {};
      if (filters.dateFrom) where.matchDate.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.matchDate.lte = new Date(filters.dateTo);
    }

    if (filters.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      const s = filters.search;
      const existingOR = where.OR || [];
      const searchClause = [
        { homeCity: { nome: { contains: s, mode: 'insensitive' } } },
        { awayCity: { nome: { contains: s, mode: 'insensitive' } } },
        { location: { contains: s, mode: 'insensitive' } },
        { eventSport: { sport: { nome: { contains: s, mode: 'insensitive' } } } },
        { eventSport: { event: { nome: { contains: s, mode: 'insensitive' } } } },
      ];

      if (existingOR.length > 0) {
        where.AND = [{ OR: existingOR }, { OR: searchClause }];
        delete where.OR;
      } else {
        where.OR = searchClause;
      }
    }

    return this.prisma.match.findMany({
      where,
      include: this.include,
      orderBy: this.orderBy,
    });
  }
}
