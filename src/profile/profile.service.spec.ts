import { describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileService } from './profile.service';

const profile = {
  id: 'profile-1',
  name: 'Ksenia Lugovaa',
  title: 'TypeScript Backend Developer',
  description: 'Backend developer',
  email: 'ksenia@example.com',
  location: 'Remote',
  githubUrl: 'https://github.com/example',
  linkedinUrl: 'https://www.linkedin.com/in/example',
  avatarUrl: null,
  createdAt: new Date('2026-11-03T00:00:00.000Z'),
};

describe('ProfileService', () => {
  it('returns the first profile with the selected fields', async () => {
    const findFirst = vi.fn().mockResolvedValue(profile);
    const prisma = { profile: { findFirst } } as unknown as PrismaService;
    const service = new ProfileService(prisma);

    await expect(service.getProfile()).resolves.toEqual(profile);
    expect(findFirst).toHaveBeenCalledWith({
      orderBy: { createdAt: 'asc' },
      select: expect.objectContaining({ id: true, name: true, description: true }),
    });
  });

  it('returns null when no profile exists', async () => {
    const prisma = {
      profile: { findFirst: vi.fn().mockResolvedValue(null) },
    } as unknown as PrismaService;
    const service = new ProfileService(prisma);

    await expect(service.getProfile()).resolves.toBeNull();
  });
});
