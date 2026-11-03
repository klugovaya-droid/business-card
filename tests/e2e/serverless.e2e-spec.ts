import { createServer, Server } from 'node:http';
import { AddressInfo } from 'node:net';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { seedData } from '../../src/database/seed-data';
import { closeServerlessApp, createHandler } from '../../src/serverless';

describe('serverless entrypoint (e2e)', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    const graphql = createHandler('/graphql');
    const health = createHandler('/health');

    server = createServer((req, res) => {
      const handler = req.url === '/health' ? health : graphql;
      void handler(req, res);
    });

    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', resolve);
    });

    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    await closeServerlessApp();
  });

  it('serves GraphQL through the serverless handler', async () => {
    const response = await request(baseUrl)
      .post('/ignored')
      .send({ query: '{ profile { name } }' })
      .expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.profile.name).toBe(seedData.name);
  });

  it('serves health through the serverless handler', async () => {
    const response = await request(baseUrl).get('/health').expect(200);

    expect(response.body).toMatchObject({ status: 'ok', db: 'up' });
  });
});
