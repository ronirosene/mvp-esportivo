import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrganizationDto) {
    const existing = await this.prisma.organization.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('Slug já está em uso');
    return this.prisma.organization.create({ data: dto as any });
  }

  async findAll() {
    return this.prisma.organization.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) throw new NotFoundException('Organização não encontrada');
    return org;
  }

  async findBySlug(slug: string) {
    const org = await this.prisma.organization.findUnique({ where: { slug } });
    if (!org) throw new NotFoundException('Organização não encontrada');
    return org;
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    await this.findOne(id);
    if (dto.slug) {
      const existing = await this.prisma.organization.findUnique({ where: { slug: dto.slug } });
      if (existing && existing.id !== id) throw new ConflictException('Slug já está em uso');
    }
    return this.prisma.organization.update({ where: { id }, data: dto as any });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.organization.delete({ where: { id } });
  }

  async getDashboard() {
    const [orgCount, eventCount, cityCount] = await Promise.all([
      this.prisma.organization.count(),
      this.prisma.event.count(),
      this.prisma.city.count(),
    ]);
    return {
      organizations: orgCount,
      events: eventCount,
      cities: cityCount,
    };
  }

  async getOrgDashboard(organizationId: string) {
    const [eventCount, sponsorCount, cityCount, matchCount] = await Promise.all([
      this.prisma.event.count({ where: { organizationId } }),
      this.prisma.sponsor.count({ where: { organizationId } }),
      this.prisma.city.count(),
      this.prisma.match.count({
        where: { eventSport: { event: { organizationId } } },
      }),
    ]);
    return { events: eventCount, sponsors: sponsorCount, cities: cityCount, matches: matchCount };
  }
}
