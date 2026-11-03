import { describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { AchievementService } from './achievement.service';

describe('AchievementService', () => {
  it('queries achievements by experience ids', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = { achievement: { findMany } } as unknown as PrismaService;
    const service = new AchievementService(prisma);

    await service.findByExperienceIds(['e1', 'e2']);

    expect(findMany).toHaveBeenCalledWith({
      where: { experienceId: { in: ['e1', 'e2'] } },
      orderBy: { sortOrder: 'asc' },
    });
  });
});
