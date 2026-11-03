import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(configService: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: configService.getOrThrow<string>('DATABASE_URL'),
    });
    const log: Prisma.LogDefinition[] =
      process.env.PRISMA_LOG_QUERIES === 'true'
        ? [{ emit: 'event', level: 'query' }]
        : [];

    super({ adapter, log });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  onQuery(listener: (query: string) => void): void {
    (this as unknown as PrismaClient<Prisma.LogLevel>).$on('query', (event) => {
      listener(event.query);
    });
  }
}
