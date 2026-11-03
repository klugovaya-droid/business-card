import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import { seedDatabase } from '../src/database/seed-database';
import { PrismaClient } from '../src/generated/prisma/client';

config();

async function main(): Promise<void> {
  const connectionString =
    process.env.DIRECT_DATABASE_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL, POSTGRES_URL or POSTGRES_URL_NON_POOLING is required',
    );
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const result = await seedDatabase(prisma);
    console.log(result === 'seeded' ? 'Seed data created' : 'Seed data already present');
  } finally {
    await prisma.$disconnect();
  }
}

void main();
