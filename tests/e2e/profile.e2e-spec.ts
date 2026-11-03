import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { seedData } from '../../src/database/seed-data';
import { createTestApp } from './create-app';

const profileQuery = `
  query Profile {
    profile {
      id
      name
      description
      githubUrl
      linkedinUrl
    }
  }
`;

describe('profile query (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns the seeded profile', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: profileQuery })
      .expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.profile).toMatchObject({
      name: seedData.name,
      description: seedData.description,
      githubUrl: seedData.githubUrl,
      linkedinUrl: seedData.linkedinUrl,
    });
  });

  it('returns nested skills and projects', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query NestedProfile {
            profile {
              skills { name category level }
              projects { name url repositoryUrl technologies }
            }
          }
        `,
      })
      .expect(200);

    expect(response.body.errors).toBeUndefined();

    const profile = response.body.data.profile;

    expect(profile.skills).toHaveLength(seedData.skills.length);
    expect(profile.projects).toHaveLength(seedData.projects.length);
    expect(profile.skills.map((item: { name: string }) => item.name)).toEqual(
      expect.arrayContaining(seedData.skills.map((item) => item.name)),
    );
    expect(profile.projects.map((item: { name: string }) => item.name)).toEqual(
      expect.arrayContaining(seedData.projects.map((item) => item.name)),
    );
  });

  it('serves Apollo Sandbox', async () => {
    const response = await request(app.getHttpServer())
      .get('/graphql')
      .set('Accept', 'text/html')
      .expect(200);

    expect(response.headers['content-type']).toContain('text/html');
    expect(response.text).toContain('Apollo Sandbox');
  });
});
