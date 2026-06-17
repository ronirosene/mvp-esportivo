import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertCompetitionFormatDto } from './dto/upsert-competition-format.dto';

@Injectable()
export class CompetitionFormatsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEventSport(eventSportId: string) {
    const es = await this.prisma.eventSport.findUnique({ where: { id: eventSportId } });
    if (!es) throw new NotFoundException('Modalidade não encontrada');

    let fmt = await this.prisma.competitionFormat.findUnique({ where: { eventSportId } });
    if (!fmt) {
      fmt = await this.prisma.competitionFormat.create({
        data: {
          eventSportId,
          formatType: es.drawMode === 'MANUAL' ? 'MANUAL' : 'GROUP_STAGE',
          groupCount: 2,
          qualifiedPerGroup: es.classificationCount,
          thirdPlaceMatch: es.generateThirdPlace,
          manualBracket: es.drawMode === 'MANUAL',
        },
      });
    }
    return fmt;
  }

  async upsert(eventSportId: string, dto: UpsertCompetitionFormatDto) {
    const es = await this.prisma.eventSport.findUnique({ where: { id: eventSportId } });
    if (!es) throw new NotFoundException('Modalidade não encontrada');

    return this.prisma.competitionFormat.upsert({
      where: { eventSportId },
      create: {
        eventSportId,
        formatType: dto.formatType,
        groupCount: dto.groupCount ?? 2,
        qualifiedPerGroup: dto.qualifiedPerGroup ?? 2,
        thirdPlaceMatch: dto.thirdPlaceMatch ?? true,
        manualBracket: dto.manualBracket ?? false,
      },
      update: {
        formatType: dto.formatType,
        groupCount: dto.groupCount,
        qualifiedPerGroup: dto.qualifiedPerGroup,
        thirdPlaceMatch: dto.thirdPlaceMatch,
        manualBracket: dto.manualBracket,
      },
    });
  }
}
