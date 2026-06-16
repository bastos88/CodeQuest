import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(24).default('dev-access-secret-change-me-please'),
  JWT_REFRESH_SECRET: z.string().min(24).default('dev-refresh-secret-change-me-please'),
  WEB_ORIGIN: z.string().url().default('http://localhost:5173'),
  PORT: z.coerce.number().default(3333),
});

export const env = envSchema.parse(process.env);
