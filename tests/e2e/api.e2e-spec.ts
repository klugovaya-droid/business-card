import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestApp } from './create-app';

describe('GraphQL API behavior (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('supports introspection', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: '{ __schema { queryType { name } } }' })
      .expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.__schema.queryType.name).toBe('Query');
  });

  it('returns a safe error for malformed queries', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: '{ profile { name ' });

    expect(response.body.errors).toBeDefined();
    expect(JSON.stringify(response.body)).not.toContain('stacktrace');
  });

  it('adds CORS headers', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .set('Origin', 'https://example.com')
      .expect(200);

    expect(response.headers['access-control-allow-origin']).toBe('https://example.com');
  });
});
