import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { Prisma } from '@prisma/client';
import type { LoginInput, RegisterInput } from '@codequest/shared';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/http.js';
import {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/tokens.js';

type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'REVIEWER' | 'ADMIN';
  xp: number;
  rating: number;
};

type UserWithPassword = PublicUser & {
  passwordHash: string;
};

type OAuthProfile = {
  email: string;
  name: string;
  avatarUrl: string | null;
};

function publicUser(user: PublicUser): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    xp: user.xp,
    rating: user.rating,
  };
}

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing)
    throw new HttpError(
      409,
      'Este e-mail ja esta cadastrado. Use outro e-mail ou faca login.',
    );

  const passwordHash = await bcrypt.hash(input.password, 12);
  let user: PublicUser;
  try {
    user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        xp: 0,
        rating: 0,
        quizzesCompleted: 0,
        correctAnswers: 0,
        totalAnswers: 0,
        streakDays: 0,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        xp: true,
        rating: true,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new HttpError(
        409,
        'Este e-mail ja esta cadastrado. Use outro e-mail ou faca login.',
      );
    }
    throw error;
  }

  return createTokenPair(user);
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      role: true,
      xp: true,
      rating: true,
    },
  });
  if (!user) throw new HttpError(401, 'Invalid credentials');
  if (!user.passwordHash) throw new HttpError(401, 'Invalid credentials');

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw new HttpError(401, 'Invalid credentials');

  return createTokenPair(user);
}

export async function refresh(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);
  const tokenHash = hashToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!stored || stored.revokedAt || stored.expiresAt < new Date())
    throw new HttpError(401, 'Invalid refresh token');

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: payload.sub },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      xp: true,
      rating: true,
    },
  });

  const next = signRefreshToken({ sub: user.id, role: user.role });
  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date(), replacedBy: hashToken(next) },
    }),
    prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(next),
        userId: user.id,
        expiresAt: daysFromNow(30),
      },
    }),
  ]);

  return {
    user: publicUser(user),
    accessToken: signAccessToken({ sub: user.id, role: user.role }),
    refreshToken: next,
  };
}

export async function logout(refreshToken: string) {
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(refreshToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export function getOAuthAuthorizationUrl(
  provider: 'github' | 'google',
  state: string,
) {
  const redirectUri = `${env.API_ORIGIN}/auth/${provider}/callback`;

  if (provider === 'github') {
    if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET)
      throw new HttpError(503, 'GitHub OAuth nao configurado.');
    const params = new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      redirect_uri: redirectUri,
      scope: 'read:user user:email',
      state,
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET)
    throw new HttpError(503, 'Google OAuth nao configurado.');
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function completeOAuth(
  provider: 'github' | 'google',
  code: string,
) {
  const profile =
    provider === 'github'
      ? await fetchGithubProfile(code)
      : await fetchGoogleProfile(code);
  const user = await findOrCreateOAuthUser(profile);
  return createTokenPair(user);
}

async function findOrCreateOAuthUser(profile: OAuthProfile) {
  const existing = await prisma.user.findUnique({
    where: { email: profile.email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      xp: true,
      rating: true,
    },
  });

  if (existing) return existing;

  const passwordHash = await bcrypt.hash(crypto.randomUUID(), 12);
  const data = {
    name: profile.name,
    email: profile.email,
    passwordHash,
    xp: 0,
    rating: 1000,
    quizzesCompleted: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    streakDays: 0,
    ...(profile.avatarUrl ? { avatarUrl: profile.avatarUrl } : {}),
  };

  return prisma.user.create({
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      xp: true,
      rating: true,
    },
  });
}

async function fetchGithubProfile(code: string): Promise<OAuthProfile> {
  const tokenResponse = await fetch(
    'https://github.com/login/oauth/access_token',
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${env.API_ORIGIN}/auth/github/callback`,
      }),
    },
  );
  const tokenData = (await tokenResponse.json()) as {
    access_token?: string;
    error?: string;
  };
  if (!tokenResponse.ok || !tokenData.access_token)
    throw new HttpError(400, tokenData.error ?? 'Falha no OAuth do GitHub.');

  const [userResponse, emailsResponse] = await Promise.all([
    fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    }),
    fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    }),
  ]);

  const user = (await userResponse.json()) as {
    name?: string | null;
    login?: string;
    avatar_url?: string | null;
    email?: string | null;
  };
  const emails = (await emailsResponse.json()) as Array<{
    email: string;
    primary: boolean;
    verified: boolean;
  }>;
  const email =
    emails.find((item) => item.primary && item.verified)?.email ?? user.email;
  if (!email)
    throw new HttpError(400, 'GitHub nao retornou e-mail verificado.');

  return {
    email,
    name: user.name ?? user.login ?? email.split('@')[0] ?? 'Usuario CodeQuest',
    avatarUrl: user.avatar_url ?? null,
  };
}

async function fetchGoogleProfile(code: string): Promise<OAuthProfile> {
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID ?? '',
      client_secret: env.GOOGLE_CLIENT_SECRET ?? '',
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${env.API_ORIGIN}/auth/google/callback`,
    }),
  });
  const tokenData = (await tokenResponse.json()) as {
    access_token?: string;
    error?: string;
  };
  if (!tokenResponse.ok || !tokenData.access_token)
    throw new HttpError(400, tokenData.error ?? 'Falha no OAuth do Google.');

  const profileResponse = await fetch(
    'https://www.googleapis.com/oauth2/v3/userinfo',
    {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    },
  );
  const profile = (await profileResponse.json()) as {
    email?: string;
    email_verified?: boolean;
    name?: string | null;
    picture?: string | null;
  };
  if (!profile.email || profile.email_verified === false)
    throw new HttpError(400, 'Google nao retornou e-mail verificado.');

  return {
    email: profile.email,
    name: profile.name ?? profile.email.split('@')[0] ?? 'Usuario CodeQuest',
    avatarUrl: profile.picture ?? null,
  };
}

async function createTokenPair(user: PublicUser | UserWithPassword) {
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role });

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: daysFromNow(30),
    },
  });

  return { user: publicUser(user), accessToken, refreshToken };
}
