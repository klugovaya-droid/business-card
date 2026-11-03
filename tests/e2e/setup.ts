import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const databaseUrlFile = join(process.cwd(), '.tmp', 'e2e-database-url');

process.env.NODE_ENV = 'test';
process.env.VERCEL = '1';
process.env.PRISMA_LOG_QUERIES = 'true';
process.env.DATABASE_URL = readFileSync(databaseUrlFile, 'utf8').trim();
