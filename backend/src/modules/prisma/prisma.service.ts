import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  private dbConnected = false;

  constructor() {
    const raw = process.env.DATABASE_URL || '';
    let url = raw;
    try {
      const parsed = new URL(raw);
      if (!parsed.searchParams.has('connect_timeout')) {
        parsed.searchParams.set('connect_timeout', '5');
      }
      url = parsed.toString();
    } catch {}
    super({ datasources: { db: { url } } });
  }

  get isConnected(): boolean {
    return this.dbConnected;
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.dbConnected = true;
      this.logger.log('Prisma connected to database');
    } catch (err) {
      this.logger.warn('Database not available, starting without connection: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma disconnected from database');
  }
}
