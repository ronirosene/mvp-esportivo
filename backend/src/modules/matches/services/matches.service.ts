import { Injectable, NotFoundException, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MatchStatus } from '@prisma/client';
import { UpdateMatchDto } from '../dto/update-match.dto';

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  private checkDb() {
    if (!this.prisma.isConnected) {
      throw new ServiceUnavailableException('Banco de dados indisponível');
    }
  }

  async findByGroup(groupId: string) {
    this.checkDb();
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Grupo não encontrado');

    return this.prisma.match.findMany({
      where: { groupId },
      include: {
        homeCity: true,
        awayCity: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async generate(groupId: string) {
    this.checkDb();
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        groupParticipants: {
          include: {
            eventSportCity: {
              include: { city: true },
            },
          },
        },
      },
    });
    if (!group) throw new NotFoundException('Grupo não encontrado');

    const participants = group.groupParticipants.map((gp) => gp.eventSportCity.city);
    if (participants.length < 2) {
      throw new BadRequestException('Mínimo de 2 participantes para gerar partidas.');
    }

    await this.prisma.match.deleteMany({ where: { groupId } });

    const matches = [];
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const match = await this.prisma.match.create({
          data: {
            groupId,
            eventSportId: group.eventSportId,
            homeCityId: participants[i].id,
            awayCityId: participants[j].id,
          },
          include: { homeCity: true, awayCity: true },
        });
        matches.push(match);
      }
    }

    return matches;
  }

  async removeByGroup(groupId: string) {
    this.checkDb();
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Grupo não encontrado');

    await this.prisma.match.deleteMany({ where: { groupId } });
    return { message: 'Partidas removidas com sucesso.' };
  }

  async update(id: string, dto: UpdateMatchDto) {
    this.checkDb();
    const match = await this.prisma.match.findUnique({ where: { id } });
    if (!match) throw new NotFoundException('Partida não encontrada');

    if (dto.status === MatchStatus.FINISHED) {
      if (dto.homeScore === undefined || dto.awayScore === undefined) {
        throw new BadRequestException('Partida finalizada exige placar.');
      }
    }

    const data: Record<string, unknown> = {};
    if (dto.homeScore !== undefined) data.homeScore = dto.homeScore;
    if (dto.awayScore !== undefined) data.awayScore = dto.awayScore;
    if (dto.matchDate !== undefined) data.matchDate = new Date(dto.matchDate);
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.status !== undefined) data.status = dto.status;

    return this.prisma.match.update({
      where: { id },
      data,
      include: { homeCity: true, awayCity: true },
    });
  }
}
