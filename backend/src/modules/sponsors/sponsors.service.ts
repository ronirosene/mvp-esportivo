import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';

@Injectable()
export class SponsorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSponsorDto) {
    return this.prisma.sponsor.create({ data: dto as any });
  }

  async findAll() {
    return this.prisma.sponsor.findMany({ orderBy: { ordem: 'asc' as const } });
  }

  async findPublic() {
    return this.prisma.sponsor.findMany({
      where: { ativo: true },
      orderBy: [{ destaque: 'desc' as const }, { ordem: 'asc' as const }],
    });
  }

  async findOne(id: string) {
    const sponsor = await this.prisma.sponsor.findUnique({ where: { id } });
    if (!sponsor) throw new NotFoundException('Patrocinador não encontrado');
    return sponsor;
  }

  async update(id: string, dto: UpdateSponsorDto) {
    await this.findOne(id);
    return this.prisma.sponsor.update({ where: { id }, data: dto as any });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.sponsor.delete({ where: { id } });
  }

  async registerView(id: string) {
    return this.prisma.sponsor.update({ where: { id }, data: { views: { increment: 1 } } });
  }

  async registerClick(id: string) {
    return this.prisma.sponsor.update({ where: { id }, data: { clicks: { increment: 1 } } });
  }
}
