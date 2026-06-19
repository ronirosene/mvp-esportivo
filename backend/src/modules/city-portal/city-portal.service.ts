import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class CityPortalService {
  constructor(private readonly prisma: PrismaService) {}

  async createCityUser(data: { nome: string; email: string; senha: string; cityId: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new BadRequestException('Email já cadastrado');
    const senha = await bcrypt.hash(data.senha, 10);
    return this.prisma.user.create({
      data: { nome: data.nome, email: data.email, senha, role: 'CIDADE' as any, cityId: data.cityId },
      select: { id: true, nome: true, email: true, role: true, cityId: true, ativo: true, createdAt: true },
    });
  }

  async listCityUsers() {
    return this.prisma.user.findMany({
      where: { role: 'CIDADE' as any },
      include: { city: { select: { id: true, nome: true, siglaEstado: true } } },
      orderBy: { createdAt: 'desc' as const },
    });
  }

  async toggleUserActive(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return this.prisma.user.update({ where: { id }, data: { ativo: !user.ativo }, select: { id: true, nome: true, email: true, role: true, ativo: true } });
  }

  async resetPassword(id: string, newSenha: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    const senha = await bcrypt.hash(newSenha, 10);
    return this.prisma.user.update({ where: { id }, data: { senha }, select: { id: true, nome: true, email: true } });
  }

  async generateInvite(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { city: true } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.prisma.inviteToken.create({ data: { token, userId, email: user.email, expiresAt } });
    return { token, expiresAt, email: user.email, cityName: user.city?.nome || '---' };
  }

  async acceptInvite(token: string) {
    const invite = await this.prisma.inviteToken.findUnique({ where: { token }, include: { user: { include: { city: true } } } });
    if (!invite) throw new NotFoundException('Convite inválido');
    if (invite.usedAt) throw new BadRequestException('Convite já utilizado');
    if (invite.expiresAt < new Date()) throw new BadRequestException('Convite expirado');
    await this.prisma.inviteToken.update({ where: { id: invite.id }, data: { usedAt: new Date() } });
    return { message: 'Convite aceito', email: invite.email, cityName: invite.user.city?.nome || '---' };
  }

  async getAvailableEvents(cityId: string) {
    return this.prisma.event.findMany({
      where: { status: { in: ['PLANEJAMENTO', 'EM_ANDAMENTO'] as any } },
      include: {
        eventSports: {
          include: {
            sport: { select: { id: true, nome: true } },
            eventSportCities: { where: { cityId } },
          },
        },
      },
      orderBy: { ano: 'desc' as const },
    });
  }

  async registerEventSport(cityId: string, eventSportId: string) {
    const esc = await this.prisma.eventSportCity.findUnique({
      where: { eventSportId_cityId: { eventSportId, cityId } },
    });
    if (esc) throw new BadRequestException('Cidade já inscrita nesta modalidade');
    return this.prisma.eventSportCity.create({
      data: { eventSportId, cityId, status: 'CONFIRMADO' as any },
    });
  }

  async cancelRegistration(cityId: string, eventSportId: string) {
    const esc = await this.prisma.eventSportCity.findUnique({
      where: { eventSportId_cityId: { eventSportId, cityId } },
    });
    if (!esc) throw new NotFoundException('Inscrição não encontrada');
    return this.prisma.eventSportCity.delete({ where: { id: esc.id } });
  }

  async myRegistrations(cityId: string) {
    return this.prisma.eventSportCity.findMany({
      where: { cityId },
      include: {
        eventSport: {
          include: {
            event: { select: { id: true, nome: true, ano: true } },
            sport: { select: { id: true, nome: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' as const },
    });
  }
}
