import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CityHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { siglaEstado: { contains: search, mode: 'insensitive' } },
      ];
    }
    const cities = await this.prisma.city.findMany({
      where,
      include: { _count: { select: { eventSportCities: true } }, champions: { where: { position: 'CHAMPION' } } },
      orderBy: { nome: 'asc' },
    });
    return cities.map((c) => ({
      id: c.id,
      nome: c.nome,
      estado: c.estado,
      siglaEstado: c.siglaEstado,
      brasaoUrl: c.brasaoUrl,
      totalTitulos: c.champions.length,
      totalParticipacoes: c._count.eventSportCities,
    }));
  }

  async findOne(id: string) {
    const city = await this.prisma.city.findUnique({ where: { id } });
    if (!city) throw new NotFoundException('Cidade não encontrada');
    const champions = await this.prisma.champion.findMany({ where: { cityId: id } });
    const participacoes = await this.prisma.eventSportCity.count({ where: { cityId: id } });
    return {
      ...city,
      totalTitulos: champions.filter((c) => c.position === 'CHAMPION').length,
      totalVices: champions.filter((c) => c.position === 'RUNNER_UP').length,
      totalTerceiros: champions.filter((c) => c.position === 'THIRD_PLACE').length,
      totalParticipacoes: participacoes,
    };
  }

  async history(id: string) {
    const city = await this.prisma.city.findUnique({ where: { id } });
    if (!city) throw new NotFoundException('Cidade não encontrada');
    const champions = await this.prisma.champion.findMany({
      where: { cityId: id },
      include: {
        event: { select: { id: true, nome: true, ano: true } },
        eventSport: { select: { id: true, displayName: true } },
      },
      orderBy: [{ event: { ano: 'desc' } }, { position: 'asc' }],
    });
    const grouped: Record<number, any[]> = {};
    for (const ch of champions) {
      if (!grouped[ch.event.ano]) grouped[ch.event.ano] = [];
      grouped[ch.event.ano].push(ch);
    }
    return grouped;
  }

  async stats(id: string) {
    const city = await this.prisma.city.findUnique({ where: { id } });
    if (!city) throw new NotFoundException('Cidade não encontrada');
    const champions = await this.prisma.champion.findMany({
      where: { cityId: id },
      include: { eventSport: true },
    });
    const modalidadesMaisVencedoras: Record<string, number> = {};
    for (const ch of champions) {
      if (ch.position === 'CHAMPION') {
        const dn = ch.eventSport.displayName;
        modalidadesMaisVencedoras[dn] = (modalidadesMaisVencedoras[dn] || 0) + 1;
      }
    }
    const sorted = Object.entries(modalidadesMaisVencedoras)
      .map(([modalidade, titulos]) => ({ modalidade, titulos }))
      .sort((a, b) => b.titulos - a.titulos);
    return {
      totalTitulos: champions.filter((c) => c.position === 'CHAMPION').length,
      totalVices: champions.filter((c) => c.position === 'RUNNER_UP').length,
      totalTerceiros: champions.filter((c) => c.position === 'THIRD_PLACE').length,
      totalParticipacoes: await this.prisma.eventSportCity.count({ where: { cityId: id } }),
      modalidadesMaisVencedoras: sorted,
    };
  }
}
