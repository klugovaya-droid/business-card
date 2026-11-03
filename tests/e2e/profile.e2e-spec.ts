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

  it('serves Apollo Sandbox', async () => {
    const response = await request(app.getHttpServer())
      .get('/graphql')
      .set('Accept', 'text/html')
      .expect(200);

    expect(response.headers['content-type']).toContain('text/html');
    expect(response.text).toContain('Apollo Sandbox');
  });
});
