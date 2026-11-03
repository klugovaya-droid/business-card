import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { seedData } from '../../src/database/seed-data';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createTestApp } from './create-app';

describe('experience and achievements (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const queries: string[] = [];

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    prisma.onQuery((query) => queries.push(query));
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns experiences with achievements using one achievements query', async () => {
    queries.length = 0;

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query Experience {
            profile {
              experience {
                company
                position
                startDate
                endDate
                achievements { text }
              }
            }
          }
        `,
      })
      .expect(200);

    expect(response.body.errors).toBeUndefined();

    const experience = response.body.data.profile.experience;
    const achievements = experience.flatMap(
      (item: { achievements: Array<{ text: string }> }) => item.achievements,
    );

    expect(experience).toHaveLength(seedData.experience.length);
    expect(achievements).toHaveLength(
      seedData.experience.reduce((total, item) => total + item.achievements.length, 0),
    );

    const achievementQueries = queries.filter((query) => query.includes('"Achievement"'));
    expect(achievementQueries).toHaveLength(1);
  });
});
