import type { Request, Response } from 'express';
import { QuestionStatus } from '@prisma/client';
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
