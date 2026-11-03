import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { sanitizeError } from '../common/errors/sanitize-error';
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
    } catch (error) {
      const details =
        process.env.VERCEL === '1' || process.env.DEBUG_ERRORS === 'true'
          ? { message: sanitizeError(error) }
          : {};

      throw new ServiceUnavailableException({
        status: 'error',
        service: 'business-card',
        timestamp,
        db: 'down',
        ...details,
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
