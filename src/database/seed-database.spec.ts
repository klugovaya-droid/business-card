import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaClient } from '../generated/prisma/client';
import { seedDatabase } from './seed-database';
import { seedData } from './seed-data';

describe('seedDatabase', () => {
  const prisma = {
    profile: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  };

  beforeEach(() => {
    prisma.profile.findUnique.mockReset();
    prisma.profile.create.mockReset();
    prisma.profile.update.mockReset();
  });

  it('updates and replaces related data when the profile exists', async () => {
    prisma.profile.findUnique.mockResolvedValue({ id: 'profile-1' });
    prisma.profile.update.mockResolvedValue({ id: 'profile-1' });

    await expect(seedDatabase(prisma as unknown as PrismaClient)).resolves.toBe('updated');

    expect(prisma.profile.update).toHaveBeenCalledWith({
      where: { id: 'profile-1' },
      data: expect.objectContaining({
        skills: { deleteMany: {}, create: seedData.skills },
        projects: { deleteMany: {}, create: seedData.projects },
      }),
    });
    expect(prisma.profile.create).not.toHaveBeenCalled();
  });

  it('creates the profile with nested data when missing', async () => {
    prisma.profile.findUnique.mockResolvedValue(null);
    prisma.profile.create.mockResolvedValue({ id: 'profile-1' });

    await expect(seedDatabase(prisma as unknown as PrismaClient)).resolves.toBe('created');

    expect(prisma.profile.create).toHaveBeenCalledTimes(1);
    expect(prisma.profile.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        slug: seedData.slug,
        skills: { create: seedData.skills },
        projects: { create: seedData.projects },
      }),
    });
  });
});
