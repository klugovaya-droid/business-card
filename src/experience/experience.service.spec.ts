import { describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { ExperienceService } from './experience.service';

describe('ExperienceService', () => {
  it('queries experiences by profile ids', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = { experience: { findMany } } as unknown as PrismaService;
    const service = new ExperienceService(prisma);

    await service.findByProfileIds(['p1', 'p2']);

    expect(findMany).toHaveBeenCalledWith({
      where: { profileId: { in: ['p1', 'p2'] } },
      orderBy: [{ startDate: 'desc' }, { company: 'asc' }],
    });
  });
});
