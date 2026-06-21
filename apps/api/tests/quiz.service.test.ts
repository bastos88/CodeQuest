import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpError } from '../src/utils/http.js';

process.env.DATABASE_URL ??=
  'postgresql://codequest:test@localhost:5432/codequest_test';

vi.mock('../src/config/prisma.js', () => ({
  prisma: {
    category: {
      findMany: vi.fn(),
    },
    question: {
      findMany: vi.fn(),
    },
    quizSession: {
      create: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}));

const { prisma } = await import('../src/config/prisma.js');
const { startQuiz } = await import('../src/services/quiz.service.js');

const categoryFindMany = vi.mocked(prisma.category.findMany);
const questionFindMany = vi.mocked(prisma.question.findMany);
const quizSessionCreate = vi.mocked(prisma.quizSession.create);
const queryRaw = vi.mocked(prisma.$queryRaw);

const categoryId = '11111111-1111-4111-8111-111111111111';

describe('quiz service startQuiz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns only the requested amount and hides correct alternatives', async () => {
    categoryFindMany.mockResolvedValue([{ id: categoryId }]);
    queryRaw.mockResolvedValue([{ id: 'question-1' }, { id: 'question-2' }]);
    questionFindMany.mockResolvedValue([
      {
        id: 'question-1',
        prompt: 'What is React?',
        difficulty: 'EASY',
        category: { id: categoryId, name: 'React', slug: 'react' },
        alternatives: [
          { id: 'alt-1', text: 'A UI library' },
          { id: 'alt-2', text: 'A database' },
        ],
      },
      {
        id: 'question-2',
        prompt: 'What is JSX?',
        difficulty: 'EASY',
        category: { id: categoryId, name: 'React', slug: 'react' },
        alternatives: [
          { id: 'alt-3', text: 'Syntax extension' },
          { id: 'alt-4', text: 'Runtime' },
        ],
      },
    ]);
    quizSessionCreate.mockResolvedValue({ id: 'session-1' });

    const result = await startQuiz('user-1', {
      categoryIds: [categoryId],
      difficulty: 'BEGINNER',
      questionCount: 2,
    });

    expect(queryRaw).toHaveBeenCalledTimes(1);
    expect(questionFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ['question-1', 'question-2'] } },
      }),
    );
    expect(quizSessionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          difficulty: 'EASY',
          questionIds: ['question-1', 'question-2'],
        }),
      }),
    );
    expect(result.questions).toHaveLength(2);
    expect(result.questions[0]?.alternatives[0]).toEqual(
      expect.not.objectContaining({ isCorrect: expect.any(Boolean) }),
    );
  });

  it('rejects an invalid category', async () => {
    categoryFindMany.mockResolvedValue([]);

    await expect(
      startQuiz('user-1', {
        categoryIds: [categoryId],
        difficulty: 'BEGINNER',
        questionCount: 5,
      }),
    ).rejects.toMatchObject<HttpError>({ statusCode: 422 });

    expect(queryRaw).not.toHaveBeenCalled();
  });

  it('rejects selections without enough approved questions', async () => {
    categoryFindMany.mockResolvedValue([{ id: categoryId }]);
    queryRaw.mockResolvedValue([{ id: 'question-1' }]);

    await expect(
      startQuiz('user-1', {
        categoryIds: [categoryId],
        difficulty: 'BEGINNER',
        questionCount: 2,
      }),
    ).rejects.toMatchObject<HttpError>({ statusCode: 400 });
  });
});
