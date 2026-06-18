import bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpError } from '../src/utils/http.js';

process.env.DATABASE_URL ??= 'postgresql://codequest:test@localhost:5432/codequest_test';
process.env.JWT_ACCESS_SECRET ??= 'test-access-secret-change-me-please';
process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret-change-me-please';

vi.mock('../src/config/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
    },
  },
}));

const { prisma } = await import('../src/config/prisma.js');
const { login } = await import('../src/services/auth.service.js');

const findUnique = vi.mocked(prisma.user.findUnique);
const createRefreshToken = vi.mocked(prisma.refreshToken.create);

describe('auth service login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects an unknown email', async () => {
    findUnique.mockResolvedValue(null);

    await expect(
      login({ email: 'missing@example.com', password: 'Password123!' }),
    ).rejects.toMatchObject<HttpError>({ statusCode: 401 });
  });

  it('rejects a user without passwordHash', async () => {
    findUnique.mockResolvedValue({
      id: 'user-1',
      name: 'OAuth User',
      email: 'oauth@example.com',
      passwordHash: null,
      role: 'USER',
      xp: 0,
      rating: 1000,
    });

    await expect(
      login({ email: 'oauth@example.com', password: 'Password123!' }),
    ).rejects.toMatchObject<HttpError>({ statusCode: 401 });
  });

  it('rejects a wrong password', async () => {
    findUnique.mockResolvedValue({
      id: 'user-1',
      name: 'Code User',
      email: 'user@example.com',
      passwordHash: await bcrypt.hash('CorrectPassword123!', 4),
      role: 'USER',
      xp: 0,
      rating: 1000,
    });

    await expect(
      login({ email: 'user@example.com', password: 'WrongPassword123!' }),
    ).rejects.toMatchObject<HttpError>({ statusCode: 401 });
  });

  it('returns tokens and never exposes passwordHash on valid login', async () => {
    findUnique.mockResolvedValue({
      id: 'user-1',
      name: 'Code User',
      email: 'user@example.com',
      passwordHash: await bcrypt.hash('CorrectPassword123!', 4),
      role: 'USER',
      xp: 120,
      rating: 1000,
    });
    createRefreshToken.mockResolvedValue({
      id: 'refresh-1',
      tokenHash: 'hash',
      userId: 'user-1',
      expiresAt: new Date(),
      revokedAt: null,
      replacedBy: null,
      createdAt: new Date(),
    });

    const result = await login({
      email: 'user@example.com',
      password: 'CorrectPassword123!',
    });

    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.refreshToken).toEqual(expect.any(String));
    expect(result.user).toEqual({
      id: 'user-1',
      name: 'Code User',
      email: 'user@example.com',
      role: 'USER',
      xp: 120,
      rating: 1000,
    });
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(createRefreshToken).toHaveBeenCalledTimes(1);
  });
});
