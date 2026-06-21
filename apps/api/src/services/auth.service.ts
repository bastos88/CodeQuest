import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import { Prisma } from '@prisma/client';
import type { LoginInput, RegisterInput } from '@codequest/shared';
import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/http.js';
import { env } from '../config/env.js';
import { sendPasswordResetEmail } from './email.service.js';
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
  emailVerified: boolean;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

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
  const email = normalizeEmail(input.email);
  const existing = await prisma.user.findUnique({
    where: { email },
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
        email,
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
  const email = normalizeEmail(input.email);
  const user = await prisma.user.findUnique({
    where: { email },
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
  if (!stored || stored.expiresAt < new Date())
    throw new HttpError(401, 'Invalid refresh token');
  if (stored.userId !== payload.sub) {
    throw new HttpError(401, 'Invalid refresh token');
  }
  if (stored.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { userId: stored.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw new HttpError(401, 'Refresh token reuse detected');
  }

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

const PASSWORD_RESET_RESPONSE =
  'Se existir uma conta com este e-mail, enviaremos instruções para redefinir sua senha.';

function hashPasswordResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function forgotPassword(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findFirst({
    where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    select: { id: true, name: true, email: true },
  });

  if (!user) return { message: PASSWORD_RESET_RESPONSE };

  const token = randomBytes(32).toString('hex');
  const tokenHash = hashPasswordResetToken(token);
  const expiresAt = new Date(
    Date.now() + env.PASSWORD_RESET_TOKEN_EXPIRES_MINUTES * 60 * 1000,
  );

  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
    prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    }),
  ]);

  const resetUrl = new URL('/reset-password', env.WEB_ORIGIN);
  resetUrl.searchParams.set('token', token);

  try {
    await sendPasswordResetEmail({
      to: user.email,
      resetUrl: resetUrl.toString(),
      userName: user.name,
    });
  } catch (error) {
    console.error('[PASSWORD RESET EMAIL ERROR]', {
      name: error instanceof Error ? error.name : 'UnknownError',
      message:
        error instanceof Error
          ? error.message
          : 'Falha desconhecida no provedor de e-mail.',
    });
  }

  return { message: PASSWORD_RESET_RESPONSE };
}

export async function resetPassword(input: {
  token: string;
  newPassword: string;
  confirmPassword: string;
}) {
  if (input.newPassword !== input.confirmPassword) {
    throw new HttpError(422, 'A confirmação da senha não confere.');
  }

  const tokenHash = hashPasswordResetToken(input.token);
  const storedToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      usedAt: true,
    },
  });

  const now = new Date();
  if (!storedToken || storedToken.usedAt || storedToken.expiresAt <= now) {
    throw new HttpError(400, 'Este link de recuperação é inválido ou expirou.');
  }

  const passwordHash = await bcrypt.hash(input.newPassword, 12);

  await prisma.$transaction(async (tx) => {
    const consumed = await tx.passwordResetToken.updateMany({
      where: {
        id: storedToken.id,
        usedAt: null,
        expiresAt: { gt: now },
      },
      data: { usedAt: now },
    });

    if (consumed.count !== 1) {
      throw new HttpError(
        400,
        'Este link de recuperação é inválido ou expirou.',
      );
    }

    await tx.user.update({
      where: { id: storedToken.userId },
      data: { passwordHash },
    });
    await tx.refreshToken.deleteMany({ where: { userId: storedToken.userId } });
  });

  return { message: 'Senha redefinida com sucesso.' };
}

export async function completeOAuth(profile: OAuthProfile) {
  const user = await findOrCreateOAuthUser(profile);
  return createTokenPair(user);
}

export async function findOrCreateOAuthUser(profile: OAuthProfile) {
  if (!profile.emailVerified) {
    throw new HttpError(401, 'OAuth provider did not return a verified email');
  }

  const email = normalizeEmail(profile.email);
  const identityKey = {
    provider: profile.provider,
    providerId: profile.providerId,
  };

  const linkedIdentity = await prisma.oAuthIdentity.findUnique({
    where: { provider_providerId: identityKey },
    select: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          xp: true,
          rating: true,
        },
      },
    },
  });

  if (linkedIdentity) return linkedIdentity.user;

  try {
    return await prisma.$transaction(async (tx) => {
      const identity = await tx.oAuthIdentity.findUnique({
        where: { provider_providerId: identityKey },
        select: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              xp: true,
              rating: true,
            },
          },
        },
      });
      if (identity) return identity.user;

      const existingEmailUser = await tx.user.findUnique({
        where: { email },
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
        await tx.oAuthIdentity.create({
          data: {
            ...identityKey,
            email,
            userId: existingEmailUser.id,
          },
        });
        if (profile.avatarUrl) {
          await tx.user.update({
            where: { id: existingEmailUser.id },
            data: { avatarUrl: profile.avatarUrl },
          });
        }
        return existingEmailUser;
      }

      return tx.user.create({
        data: {
          name: profile.name.trim(),
          email,
          passwordHash: null,
          xp: 0,
          rating: 1000,
          quizzesCompleted: 0,
          correctAnswers: 0,
          totalAnswers: 0,
          streakDays: 0,
          ...(profile.avatarUrl ? { avatarUrl: profile.avatarUrl } : {}),
          oauthIdentities: {
            create: { ...identityKey, email },
          },
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
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const oauthIdentity = await prisma.oAuthIdentity.findUnique({
        where: { provider_providerId: identityKey },
        select: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              xp: true,
              rating: true,
            },
          },
        },
      });
      if (oauthIdentity) return oauthIdentity.user;
      throw new HttpError(
        409,
        'This OAuth provider is already linked to a different identity',
      );
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
