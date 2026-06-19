import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  private checkDb() {
    if (!this.prisma.isConnected) {
      throw new ServiceUnavailableException('Banco de dados indisponível');
    }
  }

  async create(dto: CreateEventDto) {
    this.checkDb();
    return this.prisma.event.create({
      data: {
        nome: dto.nome,
        ano: dto.ano,
        cidadeSede: dto.cidadeSede,
        dataInicio: new Date(dto.dataInicio),
        dataFim: new Date(dto.dataFim),
        status: dto.status,
        logoUrl: dto.logoUrl,
        organizationId: dto.organizationId,
      },
    });
  }

  async findAll(nome?: string, ano?: number, orgSlug?: string) {
    this.checkDb();
    const where: any = {};
    if (nome) where.nome = { contains: nome, mode: 'insensitive' };
    if (ano) where.ano = ano;
    if (orgSlug) where.organization = { slug: orgSlug };

    return this.prisma.event.findMany({
      where,
      orderBy: [{ ano: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    this.checkDb();
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Evento não encontrado');
    return event;
  }

  async update(id: string, dto: UpdateEventDto) {
    await this.findOne(id);
    this.checkDb();
    const data: any = { ...dto };
    if (dto.dataInicio) data.dataInicio = new Date(dto.dataInicio);
    if (dto.dataFim) data.dataFim = new Date(dto.dataFim);
    return this.prisma.event.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    this.checkDb();
    return this.prisma.event.delete({ where: { id } });
  }
}
