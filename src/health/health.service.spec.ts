import { ServiceUnavailableException } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { HealthService } from './health.service';

describe('HealthService', () => {
  const prisma = {
    $queryRaw: vi.fn(),
  } as unknown as PrismaService;

  const service = new HealthService(prisma);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-03T12:00:00.000Z'));
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ '?column?': 1 }]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the service status when the database is available', async () => {
    await expect(service.getHealth()).resolves.toEqual({
      status: 'ok',
      service: 'business-card',
      timestamp: '2026-11-03T12:00:00.000Z',
      db: 'up',
    });
  });

  it('returns 503 when the database is unavailable', async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error('connection refused'));

    const error = await service.getHealth().catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ServiceUnavailableException);
    expect((error as ServiceUnavailableException).getStatus()).toBe(503);
    expect((error as ServiceUnavailableException).getResponse()).toMatchObject({
      status: 'error',
      service: 'business-card',
      db: 'down',
    });
  });
});
