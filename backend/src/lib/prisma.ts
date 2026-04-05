import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';
import { logger } from './logger.js';

declare global {
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  // Use the standard Prisma client with the pooled DATABASE_URL.
  // PrismaNeon/@prisma/adapter-neon is for Edge runtimes (no TCP).
  // In Node.js (Vercel Functions), standard client + pooled URL is correct.
  logger.info('Initializing Prisma client');
  return new PrismaClient({
    log: env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });
}

export const prisma = global.__prisma || createPrismaClient();

if (env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}
