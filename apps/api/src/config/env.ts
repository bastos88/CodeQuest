import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

dotenv.config({
  path: path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../.env',
  ),
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
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z
    .string()
    .min(24)
    .default('dev-access-secret-change-me-please'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(24)
    .default('dev-refresh-secret-change-me-please'),
  JWT_ISSUER: z.string().min(1).default('codequest-api'),
  JWT_AUDIENCE: z.string().min(1).default('codequest-web'),
  WEB_ORIGIN: z.string().url().default('http://localhost:5173'),
  WEB_ORIGINS: z.string().optional(),
  PORT: z.coerce.number().default(3333),
  API_ORIGIN: z.string().url().default('http://localhost:3333'),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_CALLBACK_URL: z
    .string()
    .url()
    .default('http://localhost:3333/auth/github/callback'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z
    .string()
    .url()
    .default('http://localhost:3333/auth/google/callback'),
  RESEND_API_KEY: optionalConfiguredString(z.string().trim().min(1)),
  EMAIL_FROM: optionalConfiguredString(emailFromSchema),
  PASSWORD_RESET_TOKEN_EXPIRES_MINUTES: z.coerce
    .number()
    .int()
    .positive()
    .default(60),
});

const parsedEnv = envSchema.parse(process.env);

if (parsedEnv.NODE_ENV === 'production') {
  const missingProductionSecrets = [
    ['JWT_ACCESS_SECRET', process.env.JWT_ACCESS_SECRET],
    ['JWT_REFRESH_SECRET', process.env.JWT_REFRESH_SECRET],
  ]
    .filter(([, value]) => !value || value.trim().length < 24)
    .map(([name]) => name);

  if (missingProductionSecrets.length > 0) {
    throw new Error(
      `Variaveis obrigatorias ausentes ou fracas em producao: ${missingProductionSecrets.join(', ')}`,
    );
  }
}

export const env = parsedEnv;

export const allowedWebOrigins = [
  ...new Set([
    env.WEB_ORIGIN,
    ...(env.WEB_ORIGINS ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  ]),
];
