import { describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { SkillService } from './skill.service';

describe('SkillService', () => {
  it('queries skills by profile ids', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = { skill: { findMany } } as unknown as PrismaService;
    const service = new SkillService(prisma);

    await service.findByProfileIds(['p1', 'p2']);

    expect(findMany).toHaveBeenCalledWith({
      where: { profileId: { in: ['p1', 'p2'] } },
      orderBy: [{ level: 'desc' }, { name: 'asc' }],
    });
  });
});
