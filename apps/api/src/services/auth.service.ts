import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import type { LoginInput, RegisterInput } from '@codequest/shared';
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
  passwordHash: string | null;
};

export type OAuthProvider = 'github' | 'google';

export type OAuthProfile = {
  provider: OAuthProvider;
  providerId: string;
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

export async function completeOAuth(profile: OAuthProfile) {
  const user = await findOrCreateOAuthUser(profile);
  return createTokenPair(user);
}

export async function findOrCreateOAuthUser(profile: OAuthProfile) {
  const linkedUser = await prisma.user.findFirst({
    where: {
      provider: profile.provider,
      providerId: profile.providerId,
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

  if (linkedUser) return linkedUser;

  const existingEmailUser = await prisma.user.findUnique({
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

  if (existingEmailUser) {
    return prisma.user.update({
      where: { id: existingEmailUser.id },
      data: {
        provider: profile.provider,
        providerId: profile.providerId,
        ...(profile.avatarUrl ? { avatarUrl: profile.avatarUrl } : {}),
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
  }

  try {
    return await prisma.user.create({
      data: {
        name: profile.name,
        email: profile.email,
        passwordHash: null,
        provider: profile.provider,
        providerId: profile.providerId,
        xp: 0,
        rating: 1000,
        quizzesCompleted: 0,
        correctAnswers: 0,
        totalAnswers: 0,
        streakDays: 0,
        ...(profile.avatarUrl ? { avatarUrl: profile.avatarUrl } : {}),
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
      const user = await prisma.user.findUnique({
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
      if (user) return user;
      const oauthUser = await prisma.user.findFirst({
        where: {
          provider: profile.provider,
          providerId: profile.providerId,
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
      if (oauthUser) return oauthUser;
    }
    throw error;
  }
}

export async function createTokenPair(user: PublicUser | UserWithPassword) {
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
