import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { seedDatabase } from './seed-database';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap(): Promise<void> {
    const result = await seedDatabase(this.prisma);

    this.logger.log(result === 'created' ? 'Seed data created' : 'Seed data synchronized');
  }
}
