import { describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectService } from './project.service';

describe('ProjectService', () => {
  it('queries projects by profile ids', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = { project: { findMany } } as unknown as PrismaService;
    const service = new ProjectService(prisma);

    await service.findByProfileIds(['p1', 'p2']);

    expect(findMany).toHaveBeenCalledWith({
      where: { profileId: { in: ['p1', 'p2'] } },
      orderBy: { name: 'asc' },
    });
  });
});
