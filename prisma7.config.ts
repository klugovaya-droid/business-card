import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const databaseUrl =
  process.env.DIRECT_DATABASE_URL ??
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL;

if (process.env.VERCEL) {
  console.log('[business-card] Vercel commit:', process.env.VERCEL_GIT_COMMIT_SHA ?? 'unknown');
  console.log('[business-card] DB env:', {
    DIRECT_DATABASE_URL: Boolean(process.env.DIRECT_DATABASE_URL),
    POSTGRES_URL_NON_POOLING: Boolean(process.env.POSTGRES_URL_NON_POOLING),
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    POSTGRES_URL: Boolean(process.env.POSTGRES_URL),
  });
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: databaseUrl,
  },
});
