import { Injectable, NotFoundException, ConflictException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EventSportsService {
  constructor(private readonly prisma: PrismaService) {}

  private checkDb() {
    if (!this.prisma.isConnected) {
      throw new ServiceUnavailableException('Banco de dados indisponível');
    }
  }

  async findByEvent(eventId: string) {
    this.checkDb();
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Evento não encontrado');

    return this.prisma.eventSport.findMany({
      where: { eventId },
      include: { sport: true },
      orderBy: { sport: { nome: 'asc' } },
    });
  }

  async create(eventId: string, sportId: string) {
    this.checkDb();
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Evento não encontrado');

    const sport = await this.prisma.sport.findUnique({ where: { id: sportId } });
    if (!sport) throw new NotFoundException('Modalidade não encontrada');

    const existing = await this.prisma.eventSport.findUnique({
      where: { eventId_sportId: { eventId, sportId } },
    });
    if (existing) throw new ConflictException('Modalidade já vinculada a este evento');

    return this.prisma.eventSport.create({
      data: { eventId, sportId },
      include: { sport: true },
    });
  }

  async remove(eventId: string, sportId: string) {
    this.checkDb();
    const eventSport = await this.prisma.eventSport.findUnique({
      where: { eventId_sportId: { eventId, sportId } },
    });
    if (!eventSport) throw new NotFoundException('Vínculo não encontrado');

    return this.prisma.eventSport.delete({ where: { id: eventSport.id } });
  }
}
