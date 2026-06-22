import { Injectable, NotFoundException, ConflictException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EventSportCitiesService {
  constructor(private readonly prisma: PrismaService) {}

  private checkDb() {
    if (!this.prisma.isConnected) {
      throw new ServiceUnavailableException('Banco de dados indisponível');
    }
  }

  async findByEventSport(eventSportId: string) {
    this.checkDb();
    const eventSport = await this.prisma.eventSport.findUnique({ where: { id: eventSportId } });
    if (!eventSport) throw new NotFoundException('Vínculo modalidade-evento não encontrado');

    return this.prisma.eventSportCity.findMany({
      where: { eventSportId },
      include: { city: true },
      orderBy: { city: { nome: 'asc' } },
    });
  }

  async create(eventSportId: string, cityId: string) {
    this.checkDb();
    const eventSport = await this.prisma.eventSport.findUnique({ where: { id: eventSportId } });
    if (!eventSport) throw new NotFoundException('Vínculo modalidade-evento não encontrado');

    const city = await this.prisma.city.findUnique({ where: { id: cityId } });
    if (!city) throw new NotFoundException('Cidade não encontrada');

    const existing = await this.prisma.eventSportCity.findUnique({
      where: { eventSportId_cityId: { eventSportId, cityId } },
    });
    if (existing) throw new ConflictException('Cidade já inscrita nesta modalidade');

    return this.prisma.eventSportCity.create({
      data: { eventSportId, cityId },
      include: { city: true },
    });
  }

  async createBulk(eventSportId: string, cityIds: string[]) {
    this.checkDb();
    const eventSport = await this.prisma.eventSport.findUnique({ where: { id: eventSportId } });
    if (!eventSport) throw new NotFoundException('Vínculo modalidade-evento não encontrado');

    const existing = await this.prisma.eventSportCity.findMany({
      where: { eventSportId, cityId: { in: cityIds } },
      select: { cityId: true },
    });
    const existingIds = new Set(existing.map((e) => e.cityId));

    const toCreate = cityIds.filter((id) => !existingIds.has(id));

    if (toCreate.length === 0) return [];

    const cities = await this.prisma.city.findMany({
      where: { id: { in: toCreate } },
      select: { id: true },
    });
    const validIds = new Set(cities.map((c) => c.id));
    const invalidIds = toCreate.filter((id) => !validIds.has(id));
    if (invalidIds.length > 0) {
      throw new NotFoundException(`Cidades não encontradas: ${invalidIds.join(', ')}`);
    }

    await this.prisma.eventSportCity.createMany({
      data: toCreate.map((cityId) => ({ eventSportId, cityId })),
      skipDuplicates: true,
    });

    return this.findByEventSport(eventSportId);
  }

  async remove(eventSportId: string, cityId: string) {
    this.checkDb();
    const esc = await this.prisma.eventSportCity.findUnique({
      where: { eventSportId_cityId: { eventSportId, cityId } },
    });
    if (!esc) throw new NotFoundException('Inscrição não encontrada');

    return this.prisma.eventSportCity.delete({ where: { id: esc.id } });
  }
}
