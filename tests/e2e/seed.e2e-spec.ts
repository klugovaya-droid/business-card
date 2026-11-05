import { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { seedDatabase } from '../../src/database/seed-database';
import { seedData } from '../../src/database/seed-data';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createTestApp } from './create-app';

describe('seed data (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates the profile with related data on startup', async () => {
    const profile = await prisma.profile.findUnique({
      where: { slug: seedData.slug },
      include: {
        skills: true,
        experience: { include: { achievements: true } },
        projects: true,
      },
    });

    expect(profile).not.toBeNull();
    expect(profile?.skills).toHaveLength(seedData.skills.length);
    expect(profile?.projects).toHaveLength(seedData.projects.length);
    expect(profile?.experience).toHaveLength(seedData.experience.length);
    expect(profile?.experience.flatMap((item) => item.achievements)).toHaveLength(
      seedData.experience.reduce((total, item) => total + item.achievements.length, 0),
    );
  });

  it('is idempotent on repeated runs', async () => {
    const countsBefore = {
      profiles: await prisma.profile.count(),
      skills: await prisma.skill.count(),
      experience: await prisma.experience.count(),
      achievements: await prisma.achievement.count(),
      projects: await prisma.project.count(),
    };

    await expect(seedDatabase(prisma)).resolves.toBe('updated');

    const countsAfter = {
      profiles: await prisma.profile.count(),
      skills: await prisma.skill.count(),
      experience: await prisma.experience.count(),
      achievements: await prisma.achievement.count(),
      projects: await prisma.project.count(),
    };

    expect(countsAfter).toEqual(countsBefore);
  });
});
