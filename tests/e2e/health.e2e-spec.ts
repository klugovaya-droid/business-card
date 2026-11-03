import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestApp } from './create-app';

describe('health endpoint (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns the service status and database status', async () => {
    const response = await request(app.getHttpServer()).get('/health').expect(200);

    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'business-card',
      db: 'up',
    });
    expect(typeof response.body.timestamp).toBe('string');
  });

  it('returns 404 for an unknown route', async () => {
    await request(app.getHttpServer()).get('/unknown').expect(404);
  });
});
