import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.DATABASE_URL ??= 'postgresql://codequest:test@localhost:5432/codequest_test';

vi.mock('../src/config/prisma.js', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
    },
    question: {
      count: vi.fn(),
    },
    category: {
      count: vi.fn(),
    },
    quizResult: {
      count: vi.fn(),
    },
    arenaMatch: {
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

const { prisma } = await import('../src/config/prisma.js');
const { app } = await import('../src/app.js');

const findMany = vi.mocked(prisma.user.findMany);

describe('public ranking route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes GET /public/ranking with safe top 5 data', async () => {
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

    const response = await request(app).get('/public/ranking?limit=99').expect(200);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 5,
        select: expect.not.objectContaining({
          email: true,
          passwordHash: true,
        }),
      }),
    );
    expect(response.body).toEqual([
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
    expect(response.body[0]).not.toHaveProperty('email');
    expect(response.body[0]).not.toHaveProperty('passwordHash');
  });
});
