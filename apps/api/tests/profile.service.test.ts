import bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/config/prisma.js', () => ({
  prisma: {
    user: { findUniqueOrThrow: vi.fn(), update: vi.fn() },
    refreshToken: { deleteMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

const { prisma } = await import('../src/config/prisma.js');
const { updatePassword } = await import('../src/services/profile.service.js');

describe('profile password update', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.$transaction).mockImplementation(
      async (operations: unknown) =>
        Promise.all(operations as Promise<unknown>[]) as never,
    );
  });

  it('updates the password and revokes every refresh session atomically', async () => {
    vi.mocked(prisma.user.findUniqueOrThrow).mockResolvedValue({
      passwordHash: await bcrypt.hash('CurrentPassword123!', 4),
    } as never);
    vi.mocked(prisma.user.update).mockResolvedValue({} as never);
    vi.mocked(prisma.refreshToken.deleteMany).mockResolvedValue({ count: 2 });

    await expect(
      updatePassword('user-1', {
        currentPassword: 'CurrentPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      }),
    ).resolves.toEqual({ message: 'Senha alterada com sucesso.' });

    expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
