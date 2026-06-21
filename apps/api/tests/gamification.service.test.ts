import { describe, expect, it, vi } from 'vitest';
import {
  applyContributionGamification,
  applyQuizGamification,
} from '../src/services/gamification.service.js';

describe('gamification idempotency guards', () => {
  it('serializes quiz rewards per user before checking the result guard', async () => {
    const tx = {
      $queryRaw: vi.fn().mockResolvedValue([]),
      quizResult: { updateMany: vi.fn().mockResolvedValue({ count: 0 }) },
    };

    await expect(
      applyQuizGamification(tx as never, {
        userId: 'user-1',
        quizResultId: 'result-1',
      }),
    ).rejects.toMatchObject({ statusCode: 409 });

    expect(tx.$queryRaw).toHaveBeenCalledTimes(1);
    expect(tx.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
      tx.quizResult.updateMany.mock.invocationCallOrder[0]!,
    );
  });

  it('does not award an approved contribution twice', async () => {
    const tx = {
      $queryRaw: vi.fn().mockResolvedValue([]),
      gamificationEvent: {
        findUnique: vi.fn().mockResolvedValue({ id: 'event-1' }),
        create: vi.fn(),
      },
      user: { update: vi.fn() },
    };

    await applyContributionGamification(tx as never, 'user-1', 'question-1');

    expect(tx.gamificationEvent.findUnique).toHaveBeenCalledWith({
      where: { sourceKey: 'contribution:question-1:approved' },
      select: { id: true },
    });
    expect(tx.gamificationEvent.create).not.toHaveBeenCalled();
    expect(tx.user.update).not.toHaveBeenCalled();
  });
});
