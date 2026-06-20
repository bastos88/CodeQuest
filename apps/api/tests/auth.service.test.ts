import bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.DATABASE_URL ??= 'postgresql://codequest:test@localhost:5432/codequest_test';
process.env.JWT_ACCESS_SECRET ??= 'test-access-secret-change-me-please';
process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret-change-me-please';

vi.mock('../src/config/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    passwordResetToken: {
      deleteMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      updateMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('../src/services/email.service.js', () => ({
  sendPasswordResetEmail: vi.fn(),
}));

const { prisma } = await import('../src/config/prisma.js');
const { forgotPassword, login, resetPassword } = await import('../src/services/auth.service.js');
const { sendPasswordResetEmail } = await import('../src/services/email.service.js');

const findUnique = vi.mocked(prisma.user.findUnique);
const findUserForReset = vi.mocked(prisma.user.findFirst);
const createRefreshToken = vi.mocked(prisma.refreshToken.create);
const sendResetEmail = vi.mocked(sendPasswordResetEmail);
const findResetToken = vi.mocked(prisma.passwordResetToken.findUnique);
const consumeResetToken = vi.mocked(prisma.passwordResetToken.updateMany);
const updateUser = vi.mocked(prisma.user.update);
const deleteRefreshTokens = vi.mocked(prisma.refreshToken.deleteMany);
const transaction = vi.mocked(prisma.$transaction);

type MockUser = Awaited<ReturnType<typeof prisma.user.findUnique>>;

function createMockUser(overrides: Partial<NonNullable<MockUser>> = {}): NonNullable<MockUser> {
  return {
    id: 'user-1',
    name: 'Code User',
    email: 'user@example.com',
    passwordHash: 'hashed-password',
    role: 'USER',
    xp: 0,
    rating: 1000,
    avatarUrl: null,
    quizzesCompleted: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as NonNullable<MockUser>;
}

describe('auth service login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockImplementation(async (operation: unknown) => {
      if (Array.isArray(operation)) return Promise.all(operation) as never;
      return (operation as (tx: typeof prisma) => Promise<unknown>)(prisma) as never;
    });
  });

  it('rejects an unknown email', async () => {
    findUnique.mockResolvedValue(null);

    await expect(
      login({ email: 'missing@example.com', password: 'Password123!' }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('rejects a user without passwordHash', async () => {
    findUnique.mockResolvedValue(
      createMockUser({
        name: 'OAuth User',
        email: 'oauth@example.com',
        passwordHash: null,
      }),
    );

    await expect(
      login({ email: 'oauth@example.com', password: 'Password123!' }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('rejects a wrong password', async () => {
    findUnique.mockResolvedValue(
      createMockUser({
        email: 'user@example.com',
        passwordHash: await bcrypt.hash('CorrectPassword123!', 4),
      }),
    );

    await expect(
      login({ email: 'user@example.com', password: 'WrongPassword123!' }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('returns tokens and never exposes passwordHash on valid login', async () => {
    findUnique.mockResolvedValue(
      createMockUser({
        id: 'user-1',
        name: 'Code User',
        email: 'user@example.com',
        passwordHash: await bcrypt.hash('CorrectPassword123!', 4),
        xp: 120,
        rating: 1000,
      }),
    );

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

describe('password recovery', () => {
  const neutralMessage =
    'Se existir uma conta com este e-mail, enviaremos instruções para redefinir sua senha.';

  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockImplementation(async (operation: unknown) => {
      if (Array.isArray(operation)) return Promise.all(operation) as never;
      return (operation as (tx: typeof prisma) => Promise<unknown>)(prisma) as never;
    });
  });

  it('returns the same neutral response for an unknown email', async () => {
    findUserForReset.mockResolvedValue(null);

    await expect(forgotPassword('missing@example.com')).resolves.toEqual({
      message: neutralMessage,
    });
    expect(sendResetEmail).not.toHaveBeenCalled();
  });

  it('stores only the token hash and sends the raw token only in the reset URL', async () => {
    findUserForReset.mockResolvedValue(createMockUser());

    await expect(forgotPassword('user@example.com')).resolves.toEqual({
      message: neutralMessage,
    });

    const emailInput = sendResetEmail.mock.calls[0]?.[0];
    const rawToken = new URL(emailInput?.resetUrl ?? '').searchParams.get('token');
    const createInput = vi.mocked(prisma.passwordResetToken.create).mock.calls[0]?.[0];

    expect(rawToken).toMatch(/^[a-f0-9]{64}$/);
    expect(createInput?.data.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(createInput?.data.tokenHash).not.toBe(rawToken);
    expect(createInput?.data).not.toHaveProperty('token');
  });

  it('keeps the response neutral when email delivery fails', async () => {
    findUserForReset.mockResolvedValue(createMockUser());
    sendResetEmail.mockRejectedValue(new Error('provider unavailable'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(forgotPassword('user@example.com')).resolves.toEqual({
      message: neutralMessage,
    });
    expect(errorSpy).toHaveBeenCalledWith('[PASSWORD RESET EMAIL ERROR]', {
      name: 'Error',
      message: 'provider unavailable',
    });

    errorSpy.mockRestore();
  });

  it('rejects expired and already used links with the same safe error', async () => {
    findResetToken
      .mockResolvedValueOnce({
        id: 'reset-1',
        userId: 'user-1',
        expiresAt: new Date(Date.now() - 1),
        usedAt: null,
      })
      .mockResolvedValueOnce({
        id: 'reset-2',
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 60_000),
        usedAt: new Date(),
      });

    const payload = {
      token: 'a'.repeat(64),
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    };

    await expect(resetPassword(payload)).rejects.toMatchObject({ statusCode: 400 });
    await expect(resetPassword(payload)).rejects.toMatchObject({ statusCode: 400 });
  });

  it('consumes the token, updates the password and revokes refresh sessions', async () => {
    findResetToken.mockResolvedValue({
      id: 'reset-1',
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
    });
    consumeResetToken.mockResolvedValue({ count: 1 });

    await expect(
      resetPassword({
        token: 'b'.repeat(64),
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      }),
    ).resolves.toEqual({ message: 'Senha redefinida com sucesso.' });

    const passwordHash = updateUser.mock.calls[0]?.[0].data.passwordHash;
    expect(typeof passwordHash).toBe('string');
    expect(await bcrypt.compare('NewPassword123!', passwordHash as string)).toBe(true);
    expect(consumeResetToken).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ usedAt: null }) }),
    );
    expect(deleteRefreshTokens).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
  });

  it('rejects a second concurrent consumption attempt', async () => {
    findResetToken.mockResolvedValue({
      id: 'reset-1',
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
    });
    consumeResetToken.mockResolvedValue({ count: 0 });

    await expect(
      resetPassword({
        token: 'c'.repeat(64),
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(updateUser).not.toHaveBeenCalled();
  });
});
