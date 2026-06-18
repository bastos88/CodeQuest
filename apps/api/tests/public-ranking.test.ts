import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.DATABASE_URL ??= 'postgresql://codequest:test@localhost:5432/codequest_test';

vi.mock('../src/config/prisma.js', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
    },
  },
}));

const { prisma } = await import('../src/config/prisma.js');
const { ranking } = await import('../src/controllers/public.controller.js');

const findMany = vi.mocked(prisma.user.findMany);

function createResponse() {
  const response = {
    json: vi.fn(),
  };

  return response as unknown as Response & { json: ReturnType<typeof vi.fn> };
}

describe('public ranking controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('caps public ranking at top 5 and returns only safe fields', async () => {
    findMany.mockResolvedValue([
      {
        id: 'user-1',
        name: 'Alice',
        avatarUrl: null,
        xp: 8100,
        quizzesCompleted: 10,
        correctAnswers: 8,
        totalAnswers: 10,
      },
    ]);

    const req = { query: { limit: '99' } } as unknown as Request;
    const res = createResponse();

    await ranking(req, res);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 5,
        select: expect.not.objectContaining({
          email: true,
          passwordHash: true,
        }),
      }),
    );
    expect(res.json).toHaveBeenCalledWith([
      {
        id: 'user-1',
        name: 'Alice',
        avatarUrl: null,
        xp: 8100,
        level: 10,
        accuracy: 80,
        quizzesCompleted: 10,
        position: 1,
      },
    ]);
  });

  it('works with an empty ranking', async () => {
    findMany.mockResolvedValue([]);

    const req = { query: {} } as Request;
    const res = createResponse();

    await ranking(req, res);

    expect(res.json).toHaveBeenCalledWith([]);
  });
});
