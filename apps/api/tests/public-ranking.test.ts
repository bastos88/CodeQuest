import request from 'supertest';
import { Role } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.DATABASE_URL ??=
  'postgresql://codequest:test@localhost:5432/codequest_test';

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

function createMockRankingUser() {
  return {
    id: 'user-1',
    name: 'Alice',
    email: 'alice@example.com',
    passwordHash: 'hashed-password',
    role: Role.USER,
    avatarUrl: null,
    provider: null,
    providerId: null,
    xp: 8100,
    rating: 1000,
    streakDays: 0,
    longestStreak: 0,
    lastActivityAt: null,
    activeTitleId: null,
    quizzesCompleted: 10,
    correctAnswers: 8,
    totalAnswers: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('public ranking route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes GET /public/ranking with safe top 10 data', async () => {
    findMany.mockResolvedValue([createMockRankingUser()]);

    const response = await request(app)
      .get('/public/ranking?limit=99')
      .expect(200);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 10,
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

  it('returns an empty array when there are no ranked users', async () => {
    findMany.mockResolvedValue([]);

    const response = await request(app)
      .get('/public/ranking?limit=5')
      .expect(200);

    expect(response.body).toEqual([]);
  });
});
