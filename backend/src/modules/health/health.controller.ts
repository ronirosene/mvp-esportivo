import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller()
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  private readonly startTime = Date.now();

  constructor(private readonly prisma: PrismaService) {}

  @Get('/health')
  @ApiOperation({ summary: 'Verifica status da API e banco de dados' })
  async health() {
    let dbLatency = -1;
    try {
      const before = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - before;
    } catch {
      dbLatency = -1;
    }

    return {
      status: 'ok',
      database: dbLatency >= 0 ? 'connected' : 'disconnected',
      databaseLatency: dbLatency,
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
    };
  }
}
