import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.DATABASE_URL ??=
  'postgresql://codequest:test@localhost:5432/codequest_test';
process.env.JWT_ACCESS_SECRET ??= 'test-access-secret-change-me-please';
process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret-change-me-please';

vi.mock('../src/config/prisma.js', () => ({
  prisma: {
    oAuthIdentity: { findUnique: vi.fn(), create: vi.fn() },
    user: { findUnique: vi.fn(), update: vi.fn(), create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock('../src/services/email.service.js', () => ({
  sendPasswordResetEmail: vi.fn(),
}));

const { prisma } = await import('../src/config/prisma.js');
const { findOrCreateOAuthUser } =
  await import('../src/services/auth.service.js');

describe('OAuth identity linking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.$transaction).mockImplementation(
      async (operation: unknown) =>
        (operation as (tx: typeof prisma) => Promise<unknown>)(prisma) as never,
    );
  });

  it('rejects providers that do not prove email verification', async () => {
    await expect(
      findOrCreateOAuthUser({
        provider: 'github',
        providerId: 'provider-user-1',
        email: 'user@example.com',
        emailVerified: false,
        name: 'Code User',
        avatarUrl: null,
      }),
    ).rejects.toMatchObject({ statusCode: 401 });

    expect(prisma.oAuthIdentity.findUnique).not.toHaveBeenCalled();
  });

  it('links a verified identity without overwriting another provider', async () => {
    vi.mocked(prisma.oAuthIdentity.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      name: 'Code User',
      email: 'user@example.com',
      role: 'USER',
      xp: 0,
      rating: 1000,
    } as never);
    vi.mocked(prisma.oAuthIdentity.create).mockResolvedValue({} as never);

    await expect(
      findOrCreateOAuthUser({
        provider: 'google',
        providerId: 'google-user-1',
        email: ' USER@Example.COM ',
        emailVerified: true,
        name: 'Code User',
        avatarUrl: null,
      }),
    ).resolves.toMatchObject({ id: 'user-1', email: 'user@example.com' });

    expect(prisma.oAuthIdentity.create).toHaveBeenCalledWith({
      data: {
        provider: 'google',
        providerId: 'google-user-1',
        email: 'user@example.com',
        userId: 'user-1',
      },
    });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
