import bcrypt from 'bcryptjs';
import type { LoginInput, RegisterInput } from '@codequest/shared';
import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/http.js';
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens.js';

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
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new HttpError(409, 'Email already registered');

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
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
    select: { id: true, name: true, email: true, role: true, xp: true, rating: true },
  });

  return createTokenPair(user);
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, name: true, email: true, passwordHash: true, role: true, xp: true, rating: true },
  });
  if (!user) throw new HttpError(401, 'Invalid credentials');

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw new HttpError(401, 'Invalid credentials');

  return createTokenPair(user);
}

export async function refresh(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);
  const tokenHash = hashToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) throw new HttpError(401, 'Invalid refresh token');

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, role: true, xp: true, rating: true },
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
