import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface HealthStatus {
  status: 'ok';
  service: 'business-card';
  timestamp: string;
  db: 'up';
}

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealth(): Promise<HealthStatus> {
    const timestamp = new Date().toISOString();

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        service: 'business-card',
        timestamp,
        db: 'down',
      });
    }

    return {
      status: 'ok',
      service: 'business-card',
      timestamp,
      db: 'up',
    };
  }
}
