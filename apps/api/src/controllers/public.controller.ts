import type { Request, Response } from 'express';
import { QuestionStatus } from '@prisma/client';
import { calculateAccuracy, getLevelFromXP } from '@codequest/shared';
import { prisma } from '../config/prisma.js';

export async function stats(_req: Request, res: Response) {
  const [questions, categories, users, quizzes, challenges, contributions] = await prisma.$transaction([
    prisma.question.count({
      where: {
        status: QuestionStatus.APPROVED,
        isActive: true,
        archivedAt: null,
      },
    }),
    prisma.category.count(),
    prisma.user.count(),
    prisma.quizResult.count(),
    prisma.arenaMatch.count(),
    prisma.question.count({ where: { status: QuestionStatus.APPROVED, authorId: { not: null } } }),
  ]);

  res.json({ questions, categories, users, quizzes, challenges, contributions });
}

export async function ranking(req: Request, res: Response) {
  const requestedLimit = Number(req.query.limit);
  const limit =
    Number.isInteger(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 5)
      : 5;

  const users = await prisma.user.findMany({
    orderBy: [{ xp: 'desc' }, { quizzesCompleted: 'desc' }, { correctAnswers: 'desc' }],
    take: limit,
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      xp: true,
      quizzesCompleted: true,
      correctAnswers: true,
      totalAnswers: true,
    },
  });

  res.json(
    users.map((user, index) => ({
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      xp: user.xp,
      level: getLevelFromXP(user.xp),
      accuracy: calculateAccuracy(user.correctAnswers, user.totalAnswers),
      quizzesCompleted: user.quizzesCompleted,
      position: index + 1,
    })),
  );
}
