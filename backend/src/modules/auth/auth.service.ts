import { Injectable, UnauthorizedException, ServiceUnavailableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private checkDb() {
    if (!this.prisma.isConnected) {
      throw new ServiceUnavailableException('Banco de dados indisponível');
    }
  }

  async login(dto: LoginDto) {
    this.checkDb();
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { city: { select: { id: true, nome: true, siglaEstado: true } }, organization: { select: { id: true, nome: true, slug: true } } },
    });

    if (!user) throw new UnauthorizedException('Credenciais inválidas');
    if (!user.ativo) throw new UnauthorizedException('Usuário desativado');

    const senhaValida = await bcrypt.compare(dto.senha, user.senha);
    if (!senhaValida) throw new UnauthorizedException('Credenciais inválidas');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        cityId: user.cityId,
        city: user.city,
        organizationId: user.organizationId,
        organization: user.organization,
      },
    };
  }

  async me(userId: string) {
    this.checkDb();
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { city: { select: { id: true, nome: true, siglaEstado: true } }, organization: { select: { id: true, nome: true, slug: true } } },
    });
    if (!user) throw new UnauthorizedException('Usuário não encontrado');
    return { id: user.id, nome: user.nome, email: user.email, role: user.role, cityId: user.cityId, city: user.city, organizationId: user.organizationId, organization: user.organization };
  }

  async meOrg(userId: string) {
    this.checkDb();
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: { select: { id: true, nome: true, slug: true, logoUrl: true } } },
    });
    if (!user) throw new UnauthorizedException('Usuário não encontrado');
    return user.organization;
  }
}
