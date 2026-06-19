import { Injectable, NotFoundException, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MatchStatus, Fase } from '@prisma/client';
import { UpdateMatchDto } from '../dto/update-match.dto';
import { CreateManualMatchDto } from '../dto/create-manual-match.dto';
import { ChampionsService } from '../../champions/champions.service';
import { StandingsService } from '../../standings/services/standings.service';
import { LiveService } from '../../live/live.service';

@Injectable()
export class MatchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly championsService: ChampionsService,
    private readonly standingsService: StandingsService,
    private readonly liveService: LiveService,
  ) {}

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
      orderBy: [{ round: 'asc' }, { displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async createManual(groupId: string, dto: CreateManualMatchDto) {
    this.checkDb();
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Grupo não encontrado');

    if (dto.homeCityId === dto.awayCityId) {
      throw new BadRequestException('Confronto inválido: mesma cidade.');
    }

    const duplicate = await this.prisma.match.findFirst({
      where: {
        groupId,
        homeCityId: dto.homeCityId,
        awayCityId: dto.awayCityId,
      },
    });
    if (duplicate) throw new BadRequestException('Partida duplicada neste grupo.');

    const reverse = await this.prisma.match.findFirst({
      where: {
        groupId,
        homeCityId: dto.awayCityId,
        awayCityId: dto.homeCityId,
      },
    });
    if (reverse) throw new BadRequestException('Confronto inverso já existe neste grupo.');

    return this.prisma.match.create({
      data: {
        groupId,
        eventSportId: group.eventSportId,
        homeCityId: dto.homeCityId,
        awayCityId: dto.awayCityId,
        matchDate: dto.matchDate ? new Date(dto.matchDate) : null,
        location: dto.location ?? null,
        round: dto.round ?? null,
        displayOrder: dto.displayOrder ?? null,
        fase: (dto.fase as Fase) ?? 'GRUPOS',
      },
      include: { homeCity: true, awayCity: true },
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
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: { eventSport: { include: { event: true } } },
    });
    if (!match) throw new NotFoundException('Partida não encontrada');

    if (dto.status === MatchStatus.FINISHED) {
      if (dto.homeScore === undefined || dto.awayScore === undefined) {
        throw new BadRequestException('Partida finalizada exige placar.');
      }
    }

    const prevStatus = match.status;
    const prevHomeScore = match.homeScore;
    const prevAwayScore = match.awayScore;

    const data: Record<string, unknown> = {};
    if (dto.homeScore !== undefined) data.homeScore = dto.homeScore;
    if (dto.awayScore !== undefined) data.awayScore = dto.awayScore;
    if (dto.matchDate !== undefined) data.matchDate = new Date(dto.matchDate);
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.round !== undefined) data.round = dto.round;
    if (dto.displayOrder !== undefined) data.displayOrder = dto.displayOrder;
    if (dto.status !== undefined) data.status = dto.status;

    const updated = await this.prisma.match.update({
      where: { id },
      data,
      include: { homeCity: true, awayCity: true },
    });

    const orgId = (match.eventSport.event as any).organizationId || null;
    const eventSportId = match.eventSportId;
    const eventId = match.eventSport.eventId;

    if (dto.status !== undefined && dto.status !== prevStatus) {
      if (dto.status === MatchStatus.IN_PROGRESS) {
        this.liveService.emitMatchStarted(id, updated);
      }
      if (dto.status === MatchStatus.FINISHED) {
        this.liveService.emitMatchFinished(id, eventSportId, updated);
      }
      if (dto.status === MatchStatus.CANCELLED) {
        this.liveService.emitMatchCancelled(id, eventSportId, updated);
      }
    }

    const scoreChanged = dto.homeScore !== undefined || dto.awayScore !== undefined;
    if (scoreChanged) {
      this.liveService.emitScoreUpdated(id, eventSportId, updated);
    }

    this.liveService.emitMatchUpdated(id, eventSportId, eventId, orgId, updated);

    const statusChangedOrFinished = dto.status !== undefined && dto.status !== prevStatus;
    if (scoreChanged || statusChangedOrFinished) {
      if (updated.groupId) {
        const standings = await this.standingsService.recalculateGroup(updated.groupId);
        this.liveService.emitStandingsUpdated(eventSportId, standings);
      }
    }

    if (dto.status === MatchStatus.FINISHED && (match.fase === Fase.FINAL || match.fase === Fase.TERCEIRO_LUGAR)) {
      await this.championsService.handleFinishedMatch(id);
      const champions = await this.prisma.champion.findMany({ where: { eventSportId } });
      this.liveService.emitChampionDefined(eventSportId, champions);
    }

    return updated;
  }
}
