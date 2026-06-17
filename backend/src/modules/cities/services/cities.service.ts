import { Injectable, NotFoundException, ConflictException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCityDto } from '../dto/create-city.dto';
import { UpdateCityDto } from '../dto/update-city.dto';

@Injectable()
export class CitiesService {
  constructor(private readonly prisma: PrismaService) {}

  private checkDb() {
    if (!this.prisma.isConnected) {
      throw new ServiceUnavailableException('Banco de dados indisponível');
    }
  }

  async create(dto: CreateCityDto) {
    this.checkDb();
    const existing = await this.prisma.city.findUnique({
      where: { nome_siglaEstado: { nome: dto.nome, siglaEstado: dto.siglaEstado } },
    });
    if (existing) throw new ConflictException('Cidade já cadastrada');

    return this.prisma.city.create({ data: dto });
  }

  async findAll() {
    this.checkDb();
    return this.prisma.city.findMany({ orderBy: { nome: 'asc' } });
  }

  async findOne(id: string) {
    this.checkDb();
    const city = await this.prisma.city.findUnique({ where: { id } });
    if (!city) throw new NotFoundException('Cidade não encontrada');
    return city;
  }

  async update(id: string, dto: UpdateCityDto) {
    await this.findOne(id);
    this.checkDb();
    return this.prisma.city.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    this.checkDb();
    return this.prisma.city.delete({ where: { id } });
  }
}
