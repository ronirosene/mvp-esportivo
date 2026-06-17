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

  async remove(eventSportId: string, cityId: string) {
    this.checkDb();
    const esc = await this.prisma.eventSportCity.findUnique({
      where: { eventSportId_cityId: { eventSportId, cityId } },
    });
    if (!esc) throw new NotFoundException('Inscrição não encontrada');

    return this.prisma.eventSportCity.delete({ where: { id: esc.id } });
  }
}
