import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

dotenv.config({
  path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env'),
});

const emailFromSchema = z
  .string()
  .trim()
  .regex(
    /^(?:[^<>]+\s*)?<[^<>\s]+@[^<>\s]+\.[^<>\s]+>$|^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    'EMAIL_FROM deve ser um e-mail ou o formato Nome <email@dominio.com>.',
  );

const optionalConfiguredString = (schema: z.ZodTypeAny = z.string().trim()) =>
  z.preprocess(
    (value) =>
      typeof value === 'string' && value.trim().length === 0
        ? undefined
        : value,
    schema.optional(),
  );

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(24).default('dev-access-secret-change-me-please'),
  JWT_REFRESH_SECRET: z.string().min(24).default('dev-refresh-secret-change-me-please'),
  WEB_ORIGIN: z.string().url().default('http://localhost:5173'),
  PORT: z.coerce.number().default(3333),
  API_ORIGIN: z.string().url().default('http://localhost:3333'),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_CALLBACK_URL: z.string().url().default('http://localhost:3333/auth/github/callback'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().default('http://localhost:3333/auth/google/callback'),
  RESEND_API_KEY: optionalConfiguredString(z.string().trim().min(1)),
  EMAIL_FROM: optionalConfiguredString(emailFromSchema),
  PASSWORD_RESET_TOKEN_EXPIRES_MINUTES: z.coerce.number().int().positive().default(60),
});

export const env = envSchema.parse(process.env);
