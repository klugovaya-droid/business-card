import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import { seedDatabase } from '../src/database/seed-database';
import { PrismaClient } from '../src/generated/prisma/client';

config();

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is required');
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
