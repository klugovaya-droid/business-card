import { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createTestApp } from './create-app';

describe('database schema (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('applies the initial migration', async () => {
    const rows = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `;

    const tables = rows.map((row) => row.table_name);

    expect(tables).toEqual(
      expect.arrayContaining(['Profile', 'Skill', 'Experience', 'Achievement', 'Project']),
    );
  });
});
