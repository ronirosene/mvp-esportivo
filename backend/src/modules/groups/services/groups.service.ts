import { Injectable, NotFoundException, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GroupsService {
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

    return this.prisma.group.findMany({
      where: { eventSportId },
      include: {
        groupParticipants: {
          include: {
            eventSportCity: {
              include: { city: true },
            },
          },
          orderBy: { eventSportCity: { city: { nome: 'asc' } } },
        },
      },
      orderBy: { nome: 'asc' },
    });
  }

  async create(eventSportId: string, nome: string) {
    this.checkDb();
    const eventSport = await this.prisma.eventSport.findUnique({ where: { id: eventSportId } });
    if (!eventSport) throw new NotFoundException('Vínculo modalidade-evento não encontrado');

    const existing = await this.prisma.group.findUnique({
      where: { nome_eventSportId: { nome, eventSportId } },
    });
    if (existing) throw new BadRequestException('Já existe um grupo com este nome nesta modalidade.');

    return this.prisma.group.create({
      data: { nome, eventSportId },
    });
  }

  async addParticipant(groupId: string, eventSportCityId: string) {
    this.checkDb();
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Grupo não encontrado');

    const esc = await this.prisma.eventSportCity.findUnique({ where: { id: eventSportCityId } });
    if (!esc) throw new NotFoundException('Inscrição de cidade não encontrada');

    const existing = await this.prisma.groupParticipant.findUnique({
      where: { eventSportCityId },
    });
    if (existing) throw new BadRequestException('Cidade já está em um grupo nesta modalidade.');

    return this.prisma.groupParticipant.create({
      data: { groupId, eventSportCityId },
      include: { eventSportCity: { include: { city: true } } },
    });
  }

  async removeParticipant(participantId: string) {
    this.checkDb();
    const gp = await this.prisma.groupParticipant.findUnique({ where: { id: participantId } });
    if (!gp) throw new NotFoundException('Participante não encontrado no grupo');
    return this.prisma.groupParticipant.delete({ where: { id: participantId } });
  }

  async generate(eventSportId: string, groupCount: number) {
    this.checkDb();
    const eventSport = await this.prisma.eventSport.findUnique({ where: { id: eventSportId } });
    if (!eventSport) throw new NotFoundException('Vínculo modalidade-evento não encontrado');

    const participants = await this.prisma.eventSportCity.findMany({
      where: { eventSportId, status: { not: 'DESISTENTE' } },
      orderBy: { city: { nome: 'asc' } },
    });

    if (participants.length < groupCount * 2) {
      throw new BadRequestException(
        `Mínimo de 2 participantes por grupo. Há ${participants.length} participante(s) para ${groupCount} grupo(s).`,
      );
    }
    if (groupCount > participants.length) {
      throw new BadRequestException('Não é possível criar mais grupos que participantes.');
    }

    await this.prisma.$transaction(async (tx) => {
      const existingGroups = await tx.group.findMany({ where: { eventSportId } });
      for (const g of existingGroups) {
        await tx.groupParticipant.deleteMany({ where: { groupId: g.id } });
        await tx.group.delete({ where: { id: g.id } });
      }

      const shuffled = [...participants].sort(() => Math.random() - 0.5);

      const groups = [];
      for (let i = 0; i < groupCount; i++) {
        const label = String.fromCharCode(65 + i);
        const group = await tx.group.create({
          data: {
            nome: `Grupo ${label}`,
            eventSportId,
          },
        });
        groups.push(group);
      }

      for (let i = 0; i < shuffled.length; i++) {
        const groupIndex = i % groupCount;
        await tx.groupParticipant.create({
          data: {
            groupId: groups[groupIndex].id,
            eventSportCityId: shuffled[i].id,
          },
        });
      }
    });

    return this.findByEventSport(eventSportId);
  }

  async removeAll(eventSportId: string) {
    this.checkDb();
    const eventSport = await this.prisma.eventSport.findUnique({ where: { id: eventSportId } });
    if (!eventSport) throw new NotFoundException('Vínculo modalidade-evento não encontrado');

    const groups = await this.prisma.group.findMany({ where: { eventSportId } });
    for (const g of groups) {
      await this.prisma.groupParticipant.deleteMany({ where: { groupId: g.id } });
      await this.prisma.group.delete({ where: { id: g.id } });
    }

    return { message: 'Grupos removidos com sucesso.' };
  }
}
