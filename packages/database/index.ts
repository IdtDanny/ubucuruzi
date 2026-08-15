import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Re-export PrismaClient for convenience
export { PrismaClient } from '@prisma/client';

// Export a configured client instance
export function createPrismaClient(databaseUrl: string) {
  const adapter = new PrismaPg({ connectionString: databaseUrl });
  return new PrismaClient({ adapter });
}

// Also export a default client (if DATABASE_URL is in env)
import dotenv from 'dotenv';
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is not defined');

export const prisma = createPrismaClient(databaseUrl);