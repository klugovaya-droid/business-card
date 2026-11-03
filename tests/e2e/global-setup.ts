import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';

const databaseUrlFile = join(process.cwd(), '.tmp', 'e2e-database-url');

export default async function globalSetup(): Promise<() => Promise<void>> {
  const container: StartedPostgreSqlContainer = await new PostgreSqlContainer(
    'postgres:16-alpine',
  )
    .withDatabase('business_card')
    .withUsername('postgres')
    .withPassword('postgres')
    .start();

  const databaseUrl = container.getConnectionUri();

  execFileSync('npx', ['prisma', 'migrate', 'deploy'], {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'inherit',
  });

  mkdirSync(join(process.cwd(), '.tmp'), { recursive: true });
  writeFileSync(databaseUrlFile, databaseUrl, 'utf8');

  return async () => {
    rmSync(databaseUrlFile, { force: true });
    await container.stop();
  };
}
