import { Injectable, NotFoundException, ConflictException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Gender, AgeCategory } from '@prisma/client';

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
      orderBy: { displayName: 'asc' },
    });
  }

  async create(eventId: string, sportId: string, gender?: Gender, ageCategory?: AgeCategory, displayName?: string, drawMode?: any) {
    this.checkDb();
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Evento não encontrado');
    const sport = await this.prisma.sport.findUnique({ where: { id: sportId } });
    if (!sport) throw new NotFoundException('Modalidade não encontrada');

    const g = gender || Gender.OPEN;
    const a = ageCategory || AgeCategory.LIVRE;
    const gl = g === Gender.MASCULINO ? 'Masculino' : g === Gender.FEMININO ? 'Feminino' : g === Gender.MISTO ? 'Misto' : '';
    const al = a === AgeCategory.LIVRE ? '' : a === AgeCategory.SUB_14 ? 'Sub-14' : a === AgeCategory.SUB_16 ? 'Sub-16' : a === AgeCategory.SUB_18 ? 'Sub-18' : a === AgeCategory.SUB_20 ? 'Sub-20' : a === AgeCategory.VETERANO ? 'Veterano' : 'Master';
    const dn = displayName || [sport.nome, gl, al].filter(Boolean).join(' ');

    const existing = await this.prisma.eventSport.findFirst({
      where: { eventId, sportId, gender: g, ageCategory: a },
    });
    if (existing) throw new ConflictException('Esta modalidade já existe no evento com este gênero e faixa etária');

    const eventSport = await this.prisma.eventSport.create({
      data: { eventId, sportId, gender: g, ageCategory: a, displayName: dn, ...(drawMode && { drawMode }) },
    });
    await this.prisma.competitionFormat.create({ data: { eventSportId: eventSport.id } });

    return this.prisma.eventSport.findUnique({
      where: { id: eventSport.id },
      include: { sport: true, competitionFormat: true },
    });
  }

  async update(id: string, dto: any) {
    this.checkDb();
    const es = await this.prisma.eventSport.findUnique({ where: { id } });
    if (!es) throw new NotFoundException('Vínculo não encontrado');
    return this.prisma.eventSport.update({ where: { id }, data: dto, include: { sport: true } });
  }

  async remove(eventId: string, sportId: string) {
    this.checkDb();
    const es = await this.prisma.eventSport.findFirst({ where: { eventId, sportId } });
    if (!es) throw new NotFoundException('Vínculo não encontrado');
    return this.prisma.eventSport.delete({ where: { id: es.id } });
  }
}
