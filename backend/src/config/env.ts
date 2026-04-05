import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  CLERK_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  JWT_SECRET: z.string().min(1).refine((val) => {
    if (process.env.NODE_ENV === 'production') {
      return val.length >= 32;
    }
    return true;
  }, 'JWT_SECRET must be at least 32 characters in production'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errorMsg = '❌ Invalid environment variables: ' + JSON.stringify(result.error.format());
    console.error(errorMsg);
    
    // Always throw in Vercel/Production to ensure it's caught by our index.ts wrapper
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      throw new Error(errorMsg);
    }
    process.exit(1);
  }

  return result.data;
}

export const env = parseEnv();
